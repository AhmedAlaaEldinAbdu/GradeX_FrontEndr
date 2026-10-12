import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CustomImage from '@/shared/components/CustomImage';
import EmptyState from '@/shared/components/EmptyState';
import Card from '@/shared/components/Card';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import MathIcon from '@gradex/assets/icons/Math.svg';
import GraduationCapBlueIcon from '@gradex/assets/icons/GraduationCapBlue.svg';
import TableYellowIcon from '@gradex/assets/icons/TableYellow.svg';
import UsersProfilesGreenIcon from '@gradex/assets/icons/UsersProfilesGreen.svg';
import LayersGrayIcon from '@gradex/assets/icons/LayersGray.svg';
import BookGrayIcon from '@gradex/assets/icons/BookGray.svg';
import UsersGrayIcon from '@gradex/assets/icons/UsersGray.svg';
import ArrowLeftGreenIcon from '@gradex/assets/icons/ArrowLeftGreen.svg';
import ChevronDownGreenIcon from '@gradex/assets/icons/ChevronDownGreen.svg';
import DotsVerticalGreenIcon from '@gradex/assets/icons/DotsVerticalGreen.svg';
import FilterGreenIcon from '@/assets/icons/FilterGreen.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useSuccessPopup } from '@/hooks/useSuccessPopup';
import { fetchStagesWithGrades } from '@/redux/features/grades/gradesSlice';
import { getSchoolAcademicSubSystems } from '@/redux/features/academic-subsystem/academicSubSystemSlice';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import AddClassroomModal from '../popups/AddClassroomModal';
import { getCapacityBarColor } from '../utils/CapacityBarColor';
import type { StageGradeDto } from '@/services/api/types/grades.types';

const VISIBLE_GRADES_LIMIT = 3;
const PANEL_SURFACE = 'rounded-2xl border border-[#E2E8F0]/90 bg-white';

type KpiTileProps = {
  label: string;
  value: number;
  icon: string;
  iconBgClassName: string;
};

function KpiTile({ label, value, icon, iconBgClassName }: KpiTileProps) {
  return (
    <div
      className={`flex h-[123px] items-center justify-between px-[25px] py-[17px] ${PANEL_SURFACE}`}
    >
      <div className="flex flex-col items-start gap-2">
        <span className="text-base leading-[22.4px] font-medium text-[#9D9D9D]">{label}</span>
        <span className="text-[28px] leading-[39.2px] font-bold text-[black]">
          {value.toLocaleString('en-US')}
        </span>
      </div>
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconBgClassName}`}
      >
        <CustomImage src={icon} alt="" className="h-6 w-6" />
      </div>
    </div>
  );
}

type AcademicSystemFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

function AcademicSystemFilter({ value, onChange, options }: AcademicSystemFilterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const label = t('grades.academicSystemFilter');
  const selectedLabel = options.find((option) => option.value === value)?.label;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const optionClass = (isSelected: boolean) =>
    `flex w-full items-center px-4 py-2.5 text-start text-[12px] leading-[16px] font-semibold transition-colors hover:bg-[#F8FAFC] ${
      isSelected ? 'bg-[#ECFDF5] text-[#1E7A52]' : 'text-[#1E293B]'
    }`;

  return (
    <div ref={containerRef} className="relative w-fit">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-[40px] w-[132px] items-center justify-center gap-2 rounded-lg border border-[#1E7A52] bg-[#ECFDF5] text-[12px] leading-[16px] font-semibold text-[#1E7A52] hover:bg-[#d9f7ea]"
      >
        <span className="max-w-[220px] truncate">{selectedLabel ?? label}</span>
        <CustomImage src={FilterGreenIcon} alt="" />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute start-0 top-full z-30 mt-1 max-h-60 min-w-full [scrollbar-width:thin] overflow-y-auto rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={optionClass(option.value === value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GradeCard({
  grade,
  onAddClassroom,
}: {
  grade: StageGradeDto;
  onAddClassroom: (gradeId: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const progress = Math.max(0, Math.min(100, Math.round(grade.classroomsPercentage)));
  const openGrade = () => navigate(`/classrooms/${grade.gradeId}`);

  const actions: Action[] = [
    {
      id: `view-${grade.gradeId}`,
      label: t('actions.view'),
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: openGrade,
    },
    {
      id: `add-classroom-${grade.gradeId}`,
      label: t('grades.addClassroom'),
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: () => onAddClassroom(grade.gradeId),
    },
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openGrade}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openGrade();
        }
      }}
      className="flex h-32 cursor-pointer flex-col justify-between rounded-xl border border-[#E2E8F0]/90 bg-[#F8FAFC]/70 p-[17px] transition-colors hover:border-[#1E7A52]/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm leading-[19.6px] font-semibold text-[#1E293B]">
            {grade.gradeName}
          </h3>
          <p className="flex items-center gap-1.5 text-xs leading-[16.8px] text-[#9D9D9D]">
            <span>
              {grade.classroomsCount} {t('grades.classroomsCountLabel')}
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span>
              {grade.studentsCount} {t('grades.studentsCountLabel')}
            </span>
          </p>
        </div>

        <ActionsDropdown
          actions={actions}
          triggerIcon={DotsVerticalGreenIcon}
          triggerClassName="flex size-4 shrink-0 items-center justify-center"
          iconClassName="h-4 w-4"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-end">
          <span className="text-xs leading-[16.8px] font-medium text-[#000000]">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className={`h-full rounded-full ${getCapacityBarColor(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ClassroomsList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const schoolBranchId = getCurrentSchoolBranchId();

  const stages = useAppSelector((state) => state.grades.stages);
  const stagesTotals = useAppSelector((state) => state.grades.stagesTotals);
  const isLoading = useAppSelector((state) => state.grades.isLoadingStages);
  const subSystems = useAppSelector((state) => state.academicSubSystems.schoolAcademicSubSystems);
  const [subSystemId, setSubSystemId] = useState('');
  const [addClassroomGradeId, setAddClassroomGradeId] = useState<string | null>(null);
  const { showSuccess, successPopup } = useSuccessPopup();

  const [collapsedStageIds, setCollapsedStageIds] = useState<string[]>([]);
  const [expandedStageIds, setExpandedStageIds] = useState<string[]>([]);

  const loadStages = useCallback(
    () =>
      dispatch(
        fetchStagesWithGrades({
          schoolBranchId: schoolBranchId ?? '',
          academicSubSystemId: subSystemId || undefined,
        })
      ),
    [dispatch, schoolBranchId, subSystemId]
  );

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(getSchoolAcademicSubSystems({ pageIndex: 1, pageSize: 1000, schoolBranchId }));
  }, [dispatch, schoolBranchId]);

  const hasStages = stages.length > 0;
  const shouldShowEmptyState = !isLoading && !hasStages;

  const toggleStageCollapsed = (stageId: string) => {
    setCollapsedStageIds((current) =>
      current.includes(stageId) ? current.filter((id) => id !== stageId) : [...current, stageId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-full flex justify-end">
          <AcademicSystemFilter
            value={subSystemId}
            onChange={setSubSystemId}
            options={subSystems.map((item) => ({ value: item.id, label: item.name }))}
          />
        </div>

        <KpiTile
          label={t('grades.totalStudents')}
          value={stagesTotals.totalStudents}
          icon={UsersProfilesGreenIcon}
          iconBgClassName="bg-[#ECFDF5]"
        />
        <KpiTile
          label={t('grades.totalGrades')}
          value={stagesTotals.totalGrades}
          icon={TableYellowIcon}
          iconBgClassName="bg-[#FFFBEB]"
        />
        <KpiTile
          label={t('grades.totalEducationalStages')}
          value={stagesTotals.totalStages}
          icon={GraduationCapBlueIcon}
          iconBgClassName="bg-[#F0F9FF]"
        />
      </div>

      {shouldShowEmptyState ? (
        <Card className="rounded-2xl border border-[#E2E8F0]/90" padding="lg">
          <EmptyState imgSrc={MathIcon} description={t('grades.noGradesMessage')} blend={true} />
        </Card>
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => {
            const isCollapsed = collapsedStageIds.includes(stage.lkSchoolStageId);
            const isExpanded = expandedStageIds.includes(stage.lkSchoolStageId);
            const visibleGrades = isExpanded
              ? stage.grades
              : stage.grades.slice(0, VISIBLE_GRADES_LIMIT);
            const hasMoreGrades = !isExpanded && stage.grades.length > VISIBLE_GRADES_LIMIT;

            return (
              <div key={stage.lkSchoolStageId} className={`${PANEL_SURFACE} p-[21px]`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-[17px]">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleStageCollapsed(stage.lkSchoolStageId)}
                      aria-expanded={!isCollapsed}
                      aria-label={stage.stageName}
                      className="flex size-6 shrink-0 items-center justify-center rounded"
                    >
                      <CustomImage
                        src={ChevronDownGreenIcon}
                        alt=""
                        className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <h2 className="text-base leading-6 font-bold text-[#0F172A]">
                      {stage.stageName}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm leading-[19.6px] font-medium text-[#9D9D9D]">
                    <div className="flex items-center gap-1.5">
                      <CustomImage src={UsersGrayIcon} alt="" className="h-4 w-4" />
                      <span>
                        {stage.studentsCount} {t('grades.studentsCountLabel')}
                      </span>
                    </div>
                    <span className="text-xs text-[#CBD5E1]">|</span>
                    <div className="flex items-center gap-1.5">
                      <CustomImage src={BookGrayIcon} alt="" className="h-4 w-4" />
                      <span>
                        {stage.classroomsCount} {t('grades.classroomsCountLabel')}
                      </span>
                    </div>
                    <span className="text-xs text-[#CBD5E1]">|</span>
                    <div className="flex items-center gap-1.5">
                      <CustomImage src={LayersGrayIcon} alt="" className="h-4 w-4" />
                      <span>
                        {stage.gradesCount} {t('grades.gradesCountLabel')}
                      </span>
                    </div>
                  </div>
                </div>

                {isCollapsed ? null : (
                  <>
                    <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
                      {visibleGrades.map((grade) => (
                        <GradeCard
                          key={grade.gradeId}
                          grade={grade}
                          onAddClassroom={setAddClassroomGradeId}
                        />
                      ))}
                    </div>

                    {hasMoreGrades ? (
                      <div className="mt-4 flex items-center border-t border-[#F1F5F9] pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStageIds((current) => [...current, stage.lkSchoolStageId])
                          }
                          className="flex items-center gap-1.5 text-sm leading-[19.6px] font-semibold text-[#1E7A52] underline"
                        >
                          {t('grades.viewAllGrades', { count: stage.gradesCount })}
                          <CustomImage
                            src={ArrowLeftGreenIcon}
                            alt=""
                            className="h-3.5 w-3.5 rotate-180"
                          />
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddClassroomModal
        isOpen={Boolean(addClassroomGradeId)}
        onClose={() => setAddClassroomGradeId(null)}
        gradeId={addClassroomGradeId ?? undefined}
        onSuccess={(message) => {
          loadStages();
          showSuccess(message);
        }}
      />

      {successPopup}
    </div>
  );
}
