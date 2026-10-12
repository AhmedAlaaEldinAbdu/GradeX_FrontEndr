import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@/shared/components/IconButton';
import Button from '@/shared/components/Button';
import EmptyState from '@/shared/components/EmptyState';
import CustomImage from '@/shared/components/CustomImage';
import SearchInput from '@/shared/components/SearchInput';
import TablePaginationFooter from '@/shared/components/TablePaginationFooter';
import BookBadgeIcon from '@gradex/assets/icons/BookBadge.svg';
import EditSquareGreenIcon from '@/assets/icons/EditSquareGreen24.svg';
import PlusWhiteSmIcon from '@/assets/icons/PlusWhiteSm.svg';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';
import UserGrayIcon from '@/assets/icons/UserGray14.svg';
import SearchGray16Icon from '@/assets/icons/SearchGray16.svg';
import ChevronDownGraySmIcon from '@/assets/icons/ChevronDownGraySm.svg';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { fetchSubjectSettings } from '@/redux/features/subjects/subjectsSlice';
import { getLKSchoolStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { getSchoolAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import subjectApiService from '@/services/api/subjects/subjects.service';
import type { SubjectSettingsItem } from '@/types/subjects';
import {
  FILTER_SEARCH_ICON_CLASS,
  FILTER_SEARCH_INPUT_CLASS,
  FilterSelect,
} from '../../calendar-management/components/AcademicCalendarFilterControls';
import AddEditSubjectPopup from '../popups/AddEditSubjectPopup';
import { useSuccessPopup } from '@/hooks/useSuccessPopup';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import ConfirmPopup from '@/shared/popups/ConfirmPopup';
import { getErrorMessage } from '@/lib/http';
import SubjectIcon from './SubjectIcon';
import SubjectStageBadge from './SubjectStageBadge';
import SubjectStatusBadge from './SubjectStatusBadge';
import SubjectActiveSwitch from './SubjectActiveSwitch';
import SubjectsStatsCards from './SubjectsStatsCards';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50];
const LOOKUP_LIMIT = 10;
const ALL_STAGE_NAMES = ['الكل', 'all'];

export default function SubjectsList() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language as 'ar' | 'en';
  const schoolBranchId = getCurrentSchoolBranchId();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectNameFilter, setSubjectNameFilter] = useState('');
  const [stageId, setStageId] = useState('');
  const [subSystemId, setSubSystemId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const [subjectPopup, setSubjectPopup] = useState<{
    mode: 'add' | 'edit';
    subjectId?: string;
  } | null>(null);
  const { showSuccess, successPopup } = useSuccessPopup();
  const { guardMutation } = useRoleAccess();
  const [pendingToggle, setPendingToggle] = useState<SubjectSettingsItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [lookupVersion, setLookupVersion] = useState(0);
  const [allSubjectNames, setAllSubjectNames] = useState<
    { id: string; name: string; nameEn: string }[]
  >([]);

  const items = useAppSelector((state) => state.subjects.settingsItems);
  const statistics = useAppSelector((state) => state.subjects.settingsStatistics);
  const pagination = useAppSelector((state) => state.subjects.pagination);
  const isLoading = useAppSelector((state) => state.subjects.isLoading);
  const lkStages = useAppSelector((state) => state.educationalStages.lkEducationalStages);
  const subSystems = useAppSelector((state) => state.academicSubSystems.schoolAcademicSubSystems);

  const loadSubjects = useCallback(
    () =>
      dispatch(
        fetchSubjectSettings({
          page,
          limit,
          filters: {
            searchName: searchTerm || undefined,
            materialId: subjectNameFilter || undefined,
            academicSubSystemId: subSystemId || undefined,
            lkSchoolStageId: stageId || undefined,
            schoolBranchesId: schoolBranchId || undefined,
          },
        })
      ),
    [dispatch, page, limit, searchTerm, subjectNameFilter, subSystemId, stageId, schoolBranchId]
  );

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(
      getSchoolAcademicSubSystems({
        pageIndex: 1,
        pageSize: LOOKUP_LIMIT,
        schoolBranchId: schoolBranchId,
      })
    );
  }, [dispatch, schoolBranchId]);

  const lkStagesCount = lkStages.length;
  useEffect(() => {
    if (lkStagesCount === 0) dispatch(getLKSchoolStages());
  }, [dispatch, lkStagesCount]);

  useEffect(() => {
    let cancelled = false;
    subjectApiService
      .getSubjectSettings({
        PageIndex: 1,
        PageSize: LOOKUP_LIMIT,
        SchoolBranchId: schoolBranchId || undefined,
      })
      .then((response) => {
        if (cancelled) return;
        setAllSubjectNames(
          Array.from(
            new Map(
              (response?.data?.items ?? []).map((item) => [
                item.materialId,
                {
                  id: item.materialId,
                  name: item.name,
                  nameEn: item.nameEn || item.name,
                },
              ])
            ).values()
          )
        );
      })
      .catch(() => !cancelled && setAllSubjectNames([]));
    return () => {
      cancelled = true;
    };
  }, [schoolBranchId, lookupVersion]);

  const subSystemOptions = subSystems.map((item) => ({ value: item.id, label: item.name }));
  const stageOptions = lkStages
    .filter((stage) => !ALL_STAGE_NAMES.includes(stage.nameAR?.trim().toLowerCase()))
    .filter((stage) => !ALL_STAGE_NAMES.includes(stage.nameEN?.trim().toLowerCase()))
    .map((stage) => ({
      value: stage.id,
      label: currentLang === 'ar' ? stage.nameAR : stage.nameEN || stage.nameAR,
    }));
  const subjectNameOptions = useMemo(
    () =>
      allSubjectNames.map((subject) => ({
        value: subject.id,
        label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
      })),
    [allSubjectNames, currentLang]
  );

  const hasActiveFilters = Boolean(searchTerm || subjectNameFilter || stageId || subSystemId);
  const shouldShowEmptyState = !isLoading && items.length === 0 && !hasActiveFilters;

  const resetPage = () => setPage(1);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSubjectNameFilter('');
    setStageId('');
    setSubSystemId('');
    setPage(1);
  };

  const handleToggleConfirm = async () => {
    if (!pendingToggle?.grade) return;
    const nextActive = !pendingToggle.isActive;

    setIsToggling(true);
    try {
      await subjectApiService.setGradeAvailability({
        schoolBranchId: schoolBranchId ?? '',
        materialId: pendingToggle.materialId,
        gradeId: pendingToggle.grade.id,
        isActive: nextActive,
      });
      await loadSubjects();
      setPendingToggle(null);
      showSuccess(
        t(nextActive ? 'subjects.activatedSuccessfully' : 'subjects.deactivatedSuccessfully')
      );
    } catch (error) {
      setPendingToggle(null);
      showToast({ message: getErrorMessage(error), type: 'error', isRaw: true });
    } finally {
      setIsToggling(false);
    }
  };

  const headerCell = 'px-6 py-[14px] text-sm leading-[19.6px] font-bold text-[black] uppercase';
  const localized = (lookup: { nameAr: string; nameEn: string } | null) =>
    lookup ? (currentLang === 'ar' ? lookup.nameAr : lookup.nameEn || lookup.nameAr) : '-';
  const subjectLabel = (name: string, nameEn: string | null) =>
    currentLang === 'ar' ? name : nameEn || name;

  return (
    <div className="flex flex-col gap-6">
      <SubjectsStatsCards
        subjectsCount={statistics.totalMaterials}
        teachersCount={statistics.totalTeachers}
      />

      {shouldShowEmptyState ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <EmptyState
            imgSrc={BookBadgeIcon}
            description={t('subjects.noSubjectsMessage')}
            blend={true}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] px-4 pt-4 pb-[17px]">
            <SearchInput
              name="subjects-search"
              value={searchTerm}
              onChange={(value) => {
                setSearchTerm(value.trim());
                resetPage();
              }}
              debounce={400}
              placeholder={t('subjects.filters.searchByName')}
              iconSrc={SearchGray16Icon}
              iconClass={FILTER_SEARCH_ICON_CLASS}
              wrapperClassName="w-full md:w-[270px]"
              className={FILTER_SEARCH_INPUT_CLASS}
            />

            <div className="flex flex-wrap items-center gap-4">
              <FilterSelect
                value={subSystemId}
                onChange={(value) => {
                  setSubSystemId(value);
                  resetPage();
                }}
                options={subSystemOptions}
                placeholder={t('subjects.filters.academicSystem')}
                iconSrc={ChevronDownGraySmIcon}
                className="w-full md:w-[180px]"
              />
              <FilterSelect
                value={subjectNameFilter}
                onChange={(value) => {
                  setSubjectNameFilter(value);
                  resetPage();
                }}
                options={subjectNameOptions}
                placeholder={t('subjects.filters.subjectName')}
                iconSrc={ChevronDownGraySmIcon}
                className="w-full md:w-[160px]"
              />
              <FilterSelect
                value={stageId}
                onChange={(value) => {
                  setStageId(value);
                  resetPage();
                }}
                options={stageOptions}
                placeholder={t('subjects.filters.stage')}
                iconSrc={ChevronDownGraySmIcon}
                className="w-full md:w-[180px]"
              />
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex h-[38px] items-center gap-1.5 rounded-lg border border-[#1E7A52] bg-[#ECFDF5] px-3 text-xs leading-4 font-medium whitespace-nowrap text-[#1E7A52] transition-colors hover:bg-[#D1FAE5]"
                >
                  <img src={CancelXGreenIcon} alt="" aria-hidden="true" className="h-3.5 w-3.5" />
                  {t('actions.clearFilter')}
                </button>
              ) : null}
              <Button
                actionKey="add"
                onClick={() => setSubjectPopup({ mode: 'add' })}
                icon={<CustomImage src={PlusWhiteSmIcon} alt="" className="block" />}
                className="h-[38px] gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-4! py-2! text-sm! leading-[19.6px] font-semibold! text-white! shadow-none! hover:bg-[#1E7A52]/90!"
              >
                {t('subjects.addSubject')}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]/75">
                  <th className="w-16 px-4 py-[14px] text-center text-base leading-[22.4px] font-bold tracking-[0.6px] text-[#1E7A52]">
                    #
                  </th>
                  <th className={`text-start ${headerCell}`}>{t('subjects.subjectName')}</th>
                  <th className={`text-start ${headerCell}`}>{t('subjects.filters.stage')}</th>
                  <th className={`text-start ${headerCell}`}>{t('subjects.columns.grades')}</th>
                  <th className={`text-start ${headerCell}`}>{t('subjects.columns.teachers')}</th>
                  <th className={`w-32 text-center ${headerCell}`}>
                    {t('subjects.columns.status')}
                  </th>
                  <th className={`w-36 text-center ${headerCell}`}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#9D9D9D]">
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-[#9D9D9D]">
                      {t('common.noResults')}
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={item.materialGradeId}
                      className="border-t border-[#F1F5F9] first:border-t-0"
                    >
                      <td className="px-4 py-[22.5px] text-center text-xs leading-4 font-semibold text-[#1E7A52]">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-6 py-[22px]">
                        <span className="flex items-center gap-2">
                          <SubjectIcon
                            iconName={item.iconName}
                            categoryCode={item.category?.code}
                          />
                          <span className="text-xs leading-4 font-semibold text-[#0F172A]">
                            {subjectLabel(item.name, item.nameEn)}
                          </span>
                        </span>
                      </td>
                      <td className="flex items-center justify-start gap-2 px-6 py-[19.5px]">
                        {item.stage ? (
                          <SubjectStageBadge
                            nameEn={item.stage.nameEn}
                            label={localized(item.stage)}
                          />
                        ) : (
                          <span className="text-xs text-[#9D9D9D]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-[22.5px] text-xs leading-4 font-medium text-[#9D9D9D]">
                        <div className="flex items-center justify-start gap-2">
                          {localized(item.grade)}
                        </div>
                      </td>
                      <td className="px-6 py-[22.5px] text-xs leading-4 text-[#9D9D9D]">
                        <span className="flex items-center gap-1.5">
                          <CustomImage src={UserGrayIcon} alt="" />
                          <span>{t('subjects.teachersCount', { count: item.teachersCount })}</span>
                        </span>
                      </td>
                      <td className="px-6 py-[18.5px] text-center">
                        <SubjectStatusBadge isActive={item.isActive} />
                      </td>
                      <td className="px-6 py-[18.5px]">
                        <div className="flex items-center justify-center gap-3">
                          <IconButton
                            actionKey="edit"
                            ariaLabel={t('actions.edit')}
                            onClick={() =>
                              setSubjectPopup({ mode: 'edit', subjectId: item.materialId })
                            }
                            className="size-4 rounded-none! bg-transparent! p-0! shadow-none! hover:opacity-80"
                          >
                            <CustomImage src={EditSquareGreenIcon} alt="" />
                          </IconButton>

                          <SubjectActiveSwitch
                            checked={item.isActive}
                            label={t('subjects.toggleStatus')}
                            onChange={() => guardMutation(() => setPendingToggle(item))}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TablePaginationFooter
            page={page}
            limit={limit}
            total={pagination.total}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            showingLabelKey="subjects.showing"
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value);
              resetPage();
            }}
          />
        </div>
      )}

      <AddEditSubjectPopup
        isOpen={Boolean(subjectPopup)}
        onClose={() => setSubjectPopup(null)}
        onSaved={(message) => {
          loadSubjects();
          setLookupVersion((version) => version + 1);
          showSuccess(message);
        }}
        mode={subjectPopup?.mode ?? 'add'}
        subjectId={subjectPopup?.subjectId}
      />

      <ConfirmPopup
        open={Boolean(pendingToggle)}
        tone={pendingToggle?.isActive ? 'danger' : 'success'}
        confirmLabel={t(pendingToggle?.isActive ? 'subjects.deactivate' : 'subjects.activate')}
        processingLabel={t('common.processing')}
        onConfirm={handleToggleConfirm}
        onCancel={() => setPendingToggle(null)}
        isProcessing={isToggling}
      >
        <p className="text-base leading-6 text-[black]">
          {pendingToggle
            ? t(
                pendingToggle.isActive ? 'subjects.confirmDeactivate' : 'subjects.confirmActivate',
                {
                  name: subjectLabel(pendingToggle.name, pendingToggle.nameEn),
                  grade: localized(pendingToggle.grade),
                }
              )
            : ''}
        </p>
      </ConfirmPopup>

      {successPopup}
    </div>
  );
}
