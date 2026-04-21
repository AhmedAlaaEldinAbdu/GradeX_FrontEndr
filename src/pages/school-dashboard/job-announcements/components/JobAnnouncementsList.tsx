import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import EmptyState from '@/shared/components/EmptyState';
import EmployeesIcon from '@gradex/assets/icons/Employees.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchJobAdvertisments,
  deleteJobAdvertisment,
  type JobAdvertismentFilters,
} from '@/redux/features/job-advertisments/jobAdvertismentsSlice';
import { fetchCountries, fetchSchoolStages } from '@/redux/features/lookups/lookupsSlice';
import { fetchSubjects } from '@/redux/features/subjects/subjectsSlice';
import type { JobAdvertisment } from '@/services/api/types/job-advertisment.types';
import { JobAdvertismentWorkShedule } from '@/services/api/types/job-advertisment.types';
import CustomImage from '@/shared/components/CustomImage';

const WORK_TYPE_BADGES: Record<JobAdvertismentWorkShedule, { bg?: string; text: string }> = {
  [JobAdvertismentWorkShedule.FULL_TIME]: {
    // bg: 'bg-blue-50 text-blue-700',
    text: 'jobAnnouncement.form.contractFullTime',
  },
  [JobAdvertismentWorkShedule.PART_TIME]: {
    // bg: 'bg-emerald-50 text-emerald-700',
    text: 'jobAnnouncement.form.contractPartTime',
  },
  [JobAdvertismentWorkShedule.BOTH]: {
    // bg: 'bg-violet-50 text-violet-700',
    text: 'jobAnnouncement.form.contractBoth',
  },
};

const getDynamicValue = (row: JobAdvertisment, keys: string[]): string | undefined => {
  const source = row as unknown as Record<string, unknown>;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

const normalizeText = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getLocalizedText = (
  arabic?: string | null,
  english?: string | null,
  lang: 'ar' | 'en' = 'ar'
): string | undefined => {
  const arText = normalizeText(arabic);
  const enText = normalizeText(english);
  return lang === 'ar' ? (arText ?? enText) : (enText ?? arText);
};

const buildLocalizedList = <T,>(
  list: T[] | undefined,
  mapper: (item: T) => string | undefined,
  separator: string
): string | undefined => {
  if (!Array.isArray(list) || list.length === 0) {
    return undefined;
  }

  const labels = list
    .map((item) => mapper(item))
    .map((label) => normalizeText(label))
    .filter((label): label is string => Boolean(label));

  if (labels.length === 0) {
    return undefined;
  }

  return labels.join(separator);
};

type StageNameLike = {
  id: string;
  nameAr?: string | null;
  nameEn?: string | null;
  nameAR?: string | null;
  nameEN?: string | null;
};

const resolveStageName = (stage: StageNameLike, lang: 'ar' | 'en'): string => {
  const normalizedAr = normalizeText(stage.nameAr ?? stage.nameAR);
  const normalizedEn = normalizeText(stage.nameEn ?? stage.nameEN);

  if (lang === 'ar') {
    return normalizedAr ?? normalizedEn ?? stage.id;
  }

  return normalizedEn ?? normalizedAr ?? stage.id;
};

interface FiltersParams {
  schoolBranchId: string;
  searchTerm: string;
  selectedCountryId: string;
  selectedStageId: string;
  selectedSubjectId: string;
  selectedWorkType: string;
}

const buildFiltersPayload = ({
  schoolBranchId,
  searchTerm,
  selectedCountryId,
  selectedStageId,
  selectedSubjectId,
  selectedWorkType,
}: FiltersParams): JobAdvertismentFilters => {
  const workShedule = selectedWorkType
    ? (Number(selectedWorkType) as JobAdvertismentWorkShedule)
    : undefined;

  return {
    schoolBranchId,
    searchName: searchTerm || undefined,
    lkCountryId: selectedCountryId || undefined,
    lkSchoolStageId: selectedStageId || undefined,
    materialId: selectedSubjectId || undefined,
    workShedule,
  };
};

interface LocationState {
  comeFrom?: string;
  filter?: { name?: string };
}

export default function JobAnnouncementsList() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const filtered = locationState?.filter;
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const userData = localStorage.getItem('userData') || undefined;
  const schoolBranchId = userData ? JSON.parse(userData)?.schoolBranchId : undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedAnnouncementStatus, setSelectedAnnouncementStatus] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const { jobAdvertisments, pagination, isLoading, isDeleting } = useAppSelector(
    (state) => state.jobAdvertisments
  );

  const { countries, schoolStages, isLoadingCountries, isLoadingSchoolStages } = useAppSelector(
    (state) => state.lookups
  );
  const { subjects, isLoading: isLoadingSubjects } = useAppSelector((state) => state.subjects);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchSchoolStages());
    dispatch(fetchSubjects({ page: 1, limit: 10000 }));
  }, [dispatch]);

  useEffect(() => {
    const filtersPayload = buildFiltersPayload({
      schoolBranchId: schoolBranchId || '',
      searchTerm,
      selectedCountryId,
      selectedStageId,
      selectedSubjectId,
      selectedWorkType,
    });

    const fetchData = async () => {
      try {
        await dispatch(
          fetchJobAdvertisments({
            page: currentPage,
            limit: pagination.limit,
            filters: filtersPayload,
          })
        ).unwrap();
      } catch (error) {
        showToast({ type: 'error', message: 'common.errorOccurred' });
      }
    };

    fetchData();
  }, [
    dispatch,
    currentPage,
    pagination.limit,
    searchTerm,
    selectedCountryId,
    selectedStageId,
    selectedSubjectId,
    selectedWorkType,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCountryId,
    selectedStageId,
    selectedAnnouncementStatus,
    selectedSubjectId,
    selectedWorkType,
  ]);

  const countryOptions = Array.isArray(countries)
    ? countries.map((country) => ({
        value: country.id,
        label: currentLang === 'ar' ? country.arabicName : country.englishName,
      }))
    : [];

  const stageOptions = Array.isArray(schoolStages)
    ? schoolStages.map((stage) => ({
        value: stage.id,
        label: resolveStageName(stage as StageNameLike, currentLang),
      }))
    : [];

  const subjectOptions = Array.isArray(subjects)
    ? subjects.map((subject) => ({
        value: subject.id,
        label: currentLang === 'ar' ? subject.name : subject.nameEn || subject.name,
      }))
    : [];

  const countryLabelMap = countryOptions.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  const stageLabelMap = stageOptions.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  const subjectLabelMap = subjectOptions.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  const workTypeOptions = useMemo(() => {
    const baseOptions = [
      {
        value: String(JobAdvertismentWorkShedule.FULL_TIME),
        labelKey: 'jobAnnouncement.form.contractFullTime',
      },
      {
        value: String(JobAdvertismentWorkShedule.PART_TIME),
        labelKey: 'jobAnnouncement.form.contractPartTime',
      },
    ];

    return baseOptions.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));
  }, [t]);

  const announcementStatusOptions = useMemo(
    () => [
      { value: 'active', label: t('jobAnnouncement.statusOptions.active') },
      { value: 'expired', label: t('jobAnnouncement.statusOptions.expired') },
    ],
    [t]
  );

  const numberLocale = currentLang === 'ar' ? 'ar-EG' : 'en-US';
  const joinSeparator = currentLang === 'ar' ? '، ' : ', ';

  const hasActiveFilters = Boolean(
    searchTerm ||
      selectedCountryId ||
      selectedStageId ||
      selectedAnnouncementStatus ||
      selectedSubjectId ||
      selectedWorkType
  );
  const dataSource = Array.isArray(jobAdvertisments) ? jobAdvertisments : [];
  const shouldShowEmptyState = !isLoading && dataSource.length === 0 && !hasActiveFilters;
  const shouldShowContent = isLoading || dataSource.length > 0 || hasActiveFilters;
  const tablePagination = {
    page: pagination?.page || currentPage,
    limit: pagination?.limit || 10,
    total: pagination?.total || 0,
    totalPages: pagination?.totalPages || 0,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCountryId('');
    setSelectedStageId('');
    setSelectedAnnouncementStatus('');
    setSelectedSubjectId('');
    setSelectedWorkType('');
  };

  const columns: DataTableColumn<JobAdvertisment>[] = [
    {
      header: '#',
      accessor: (_row) => {
        const index = dataSource.findIndex((item) => item.id === _row.id);
        if (index === -1) {
          return '--';
        }
        const page = tablePagination.page || 1;
        const limit = tablePagination.limit || 10;
        return (page - 1) * limit + (index + 1);
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.form.jobName',
      accessor: (row) => (
        <span>
          {currentLang === 'ar'
            ? (normalizeText(row.name) ?? normalizeText(row.nameEn) ?? '--')
            : (normalizeText(row.nameEn) ?? normalizeText(row.name) ?? '--')}
        </span>
      ),
      headerClassName: 'min-w-[250px]',
    },
    {
      header: 'jobAnnouncement.jobGrade',
      accessor: (row) => (
        <span>
          {(() => {
            const keys =
              currentLang === 'ar'
                ? ['jobGradeNameAr', 'lkTeacherLevelNameAr']
                : ['jobGradeNameEn', 'lkTeacherLevelNameEn'];
            return (
              getDynamicValue(row, keys) ||
              (currentLang === 'ar' ? row.name : row.nameEn) ||
              row.name ||
              '--'
            );
          })()}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'jobAnnouncement.jobType',
      accessor: (row) => (
        <span>
          {(() => {
            const qualificationTypeLabel =
              row.qualificationType === 1
                ? t('jobAnnouncement.form.jobCategoryAdmin')
                : row.qualificationType === 2
                  ? t('jobAnnouncement.form.jobCategoryTeacher')
                  : undefined;

            if (qualificationTypeLabel) {
              return qualificationTypeLabel;
            }

            const keys =
              currentLang === 'ar'
                ? ['jobTypeNameAr', 'lkAdministrativePositionNameAr']
                : ['jobTypeNameEn', 'lkAdministrativePositionNameEn'];
            return (
              getDynamicValue(row, keys) ||
              getDynamicValue(row, ['lkAdministrativePositionName']) ||
              row.lkAdministrativePositionId ||
              '--'
            );
          })()}
        </span>
      ),
      headerClassName: 'min-w-[160px]',
    },
    {
      header: 'jobAnnouncement.workType',
      accessor: (row) => (
        <div className="flex justify-center">
          {row.workShedule !== undefined && row.workShedule !== null ? (
            <span
              className={`rounded-full px-3 py-1 text-base font-medium ${
                WORK_TYPE_BADGES[row.workShedule]?.bg || 'text-gray-500'
              }`}
            >
              {WORK_TYPE_BADGES[row.workShedule]
                ? t(WORK_TYPE_BADGES[row.workShedule].text)
                : row.workShedule}
            </span>
          ) : (
            <span className="text-sm text-gray-500">--</span>
          )}
        </div>
      ),
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsCount',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2 text-base">
          <IconButton
            variant="blue"
            ariaLabel={t('jobAnnouncement.viewApplicants')}
            onClick={() => navigate(`/job-announcements/${row.id}/applicants`)}
            className="h-8 w-8"
          >
            <CustomImage
              src={EyeStyledIcon}
              alt={t('jobAnnouncement.viewApplicants')}
              className="h-4 w-4"
            />
          </IconButton>
          <span>
            {(() => {
              const value = (row as unknown as Record<string, unknown>).applicantsCount;
              if (typeof value === 'number') {
                return value.toLocaleString(numberLocale);
              }
              return '--';
            })()}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[170px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.subjectName',
      accessor: (row) => (
        <span>
          {(() => {
            const materialLabel = buildLocalizedList(
              row.jobAdvertismentMaterialDto,
              (material) =>
                getLocalizedText(material.materialNameAr, material.materialNameEn, currentLang) ||
                (material.materialId ? subjectLabelMap[material.materialId] : undefined),
              joinSeparator
            );

            if (materialLabel) {
              return materialLabel;
            }

            const fallbackSubjectId =
              row.materialId || row.jobAdvertismentMaterialDto?.[0]?.materialId;
            if (fallbackSubjectId && subjectLabelMap[fallbackSubjectId]) {
              return subjectLabelMap[fallbackSubjectId];
            }
            const dynamicKey =
              currentLang === 'ar'
                ? ['subjectNameAr', 'materialNameAr']
                : ['subjectNameEn', 'materialNameEn'];
            return getDynamicValue(row, dynamicKey) || '--';
          })()}
        </span>
      ),
      headerClassName: 'min-w-[170px]',
    },
    {
      header: 'jobAnnouncement.country',
      accessor: (row) => (
        <span>
          {(() => {
            const countryLabel = buildLocalizedList(
              row.jobAdvertisementCountryDto,
              (country) =>
                getLocalizedText(country.lkCountryNameAr, country.lkCountryNameEn, currentLang) ||
                (country.lkCountryId ? countryLabelMap[country.lkCountryId] : undefined),
              joinSeparator
            );

            if (countryLabel) {
              return countryLabel;
            } else {
              return <div>{t('common.all')}</div>;
            }
          })()}
        </span>
      ),
      headerClassName: 'min-w-[170px]',
    },
    {
      header: 'jobAnnouncement.educationalStages',
      accessor: (row) => (
        <span>
          {(() => {
            const stageLabel = buildLocalizedList(
              row.jobAdvertisementSchoolStageDto,
              (stage) =>
                getLocalizedText(
                  stage.lkSchoolStageNameAr,
                  stage.lkSchoolStageNameEn,
                  currentLang
                ) || (stage.lkSchoolStageId ? stageLabelMap[stage.lkSchoolStageId] : undefined),
              joinSeparator
            );

            if (stageLabel) {
              return stageLabel;
            }

            const fallbackKey =
              currentLang === 'ar' ? ['schoolStageNameAr'] : ['schoolStageNameEn'];
            return getDynamicValue(row, fallbackKey) || '--';
          })()}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'jobAnnouncement.academicQualification',
      accessor: (row) => (
        <span>
          {(() => {
            const qualificationLabel = buildLocalizedList(
              row.jobAdvertisementQualificationDto,
              (qualification) =>
                getLocalizedText(
                  qualification.lkQualificationNameAr,
                  qualification.lkQualificationNameEn,
                  currentLang
                ),
              joinSeparator
            );

            if (qualificationLabel) {
              return qualificationLabel;
            }

            const keys =
              currentLang === 'ar'
                ? ['qualificationNameAr', 'qualificationTypeNameAr']
                : ['qualificationNameEn', 'qualificationTypeNameEn'];
            const label = getDynamicValue(row, keys);
            if (label) {
              return label;
            }
            return row.qualificationType?.toString() || '--';
          })()}
        </span>
      ),
      headerClassName: 'min-w-[220px]',
    },
    {
      header: 'jobAnnouncement.yearsOfExperience',
      accessor: (row) => (
        <span>
          {typeof row.yearsExperience === 'number'
            ? row.yearsExperience.toLocaleString(numberLocale)
            : '--'}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'jobAnnouncement.salary',
      accessor: (row) => (
        <span>
          {(() => {
            const hasMin = typeof row.minimumSalary === 'number';
            const hasMax = typeof row.maximumSalary === 'number';
            if (hasMin && hasMax) {
              const min = row.minimumSalary.toLocaleString(numberLocale);
              const max = row.maximumSalary && row.maximumSalary.toLocaleString(numberLocale);
              return max ? `${min} - ${max}` : `${min}`;
            }
            if (typeof row.salary === 'number') {
              return row.salary.toLocaleString(numberLocale);
            }
            return t('jobAnnouncement.toBeDeterminedLater');
          })()}
        </span>
      ),
      headerClassName: 'min-w-[180px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/job-announcements/edit-job-announcement/${row.id}`)}
            ariaLabel={t('actions.edit')}
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedJobId(row.id);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting}
            ariaLabel={t('actions.delete')}
          />
        </div>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'job-announcements-search',
      placeholder: t('jobAnnouncement.searchJobGrade'),
      value: filtered?.name ? filtered?.name : searchTerm,
      onChange: (value) => setSearchTerm((value as string) ?? ''),
      width: '30%',
    },
     {
      type: 'custom',
      name: 'job-announcements-subject',
      placeholder: '',
      value: selectedSubjectId,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedSubjectId}
          onChange={(value) =>
            setSelectedSubjectId(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            )
          }
          options={subjectOptions}
          placeholder={isLoadingSubjects ? t('common.loading') : t('jobAnnouncement.subjectName')}
          disabled={isLoadingSubjects}
          maxHeight="200px"
        />
      ),
    },
    
    {
      type: 'custom',
      name: 'job-announcements-stage',
      placeholder: '',
      value: selectedStageId,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStageId}
          onChange={(value) =>
            setSelectedStageId(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            )
          }
          options={stageOptions}
          placeholder={
            isLoadingSchoolStages ? t('common.loading') : t('jobAnnouncement.educationalStages')
          }
          disabled={isLoadingSchoolStages}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'job-announcements-status',
      placeholder: '',
      value: selectedAnnouncementStatus,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedAnnouncementStatus}
          onChange={(value) =>
            setSelectedAnnouncementStatus(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            )
          }
          options={announcementStatusOptions}
          placeholder={t('jobAnnouncement.announcementStatus')}
          maxHeight="160px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'job-announcements-country',
      placeholder: '',
      value: selectedCountryId,
      onChange: () => {},
      width: '12%',
      customComponent: (
        <CustomSelect
          value={selectedCountryId}
          onChange={(value) =>
            setSelectedCountryId(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            )
          }
          options={countryOptions}
          placeholder={isLoadingCountries ? t('common.loading') : t('jobAnnouncement.country')}
          disabled={isLoadingCountries}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'job-announcements-work-type',
      placeholder: '',
      value: selectedWorkType,
      onChange: () => {},
      width: '15%',
      customComponent: (
        <CustomSelect
          value={selectedWorkType}
          onChange={(value) =>
            setSelectedWorkType(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            )
          }
          options={workTypeOptions}
          placeholder={t('jobAnnouncement.workType')}
          maxHeight="160px"
        />
      ),
    },
   
  ];

  const handleDeleteConfirm = async () => {
    if (!selectedJobId) return;

    try {
      await dispatch(deleteJobAdvertisment(selectedJobId))
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess === true || res === selectedJobId) {
            showToast({
              message: 'jobAnnouncement.announcementDeletedSuccessfully',
              type: 'success',
            });
          } else {
            showToast({
              message: 'common.errorOccurred',
              type: 'error',
            });
          }
        });
      setShowDeletePopup(false);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'common.errorOccurred',
      });
      return;
    }

    const filtersPayload = buildFiltersPayload({
      schoolBranchId: schoolBranchId,
      searchTerm,
      selectedCountryId,
      selectedStageId,
      selectedSubjectId,
      selectedWorkType,
    });

    try {
      await dispatch(
        fetchJobAdvertisments({
          page: currentPage,
          limit: pagination.limit || 10,
          filters: filtersPayload,
        })
      ).unwrap();
    } catch (error) {
      showToast({
        type: 'error',
        message: 'common.errorOccurred',
      });
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={EmployeesIcon}
          description={t('jobAnnouncement.noAnnouncementsMessage')}
          blend={true}
        />
      ) : shouldShowContent ? (
        <>
          <DataTable
            data={dataSource}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={tablePagination}
            onPageChange={handlePageChange}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={handleResetFilters}
            isLoading={isLoading}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          <DeletePopup
            open={showDeletePopup}
            message="jobAnnouncement.confirmDeleteAnnouncement"
            itemName={(() => {
              const selected = dataSource.find((j) => j.id === selectedJobId);
              const nameAr = (selected as any)?.name;
              const nameEn = (selected as any)?.nameEn;
              return currentLang === 'ar' ? (nameAr ?? '') : (nameEn ?? nameAr ?? '');
            })()}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
        </>
      ) : null}
    </Card>
  );
}
