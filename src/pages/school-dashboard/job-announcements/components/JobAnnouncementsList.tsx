import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import EmptyState from '@/shared/components/EmptyState';
import EmployeesIcon from '@gradex/assets/icons/Employees.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
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
import { JobType } from '@/services/api/types/job-advertisment.types';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

const WORK_TYPE_BADGES: Record<JobType, { bg: string; text: string }> = {
  [JobType.FULLTIME]: {
    bg: 'bg-green-50 text-green-700',
    text: 'jobAnnouncement.fullTime',
  },
  [JobType.PARTTIME]: {
    bg: 'bg-blue-50 text-blue-700',
    text: 'jobAnnouncement.partTime',
  },
};

// Toggle this flag when you need mock entries to preview the table layout.
const SHOULD_USE_DUMMY_JOB_DATA = true;

const DUMMY_JOB_ADVERTISMENTS = [
  {
    id: 'demo-1',
    name: 'معلم رياضيات',
    nameEn: 'Mathematics Teacher',
    schoolBranchId: 'branch-1',
    qualificationType: 1,
    materialId: 'subject-math',
    jobDescription: 'Expert in algebra and geometry curricula.',
    jobDescriptionEn: 'Expert in algebra and geometry curricula.',
    jobResponsibilities: 'إعداد دروس تفاعلية ومتابعة أداء الطلاب.',
    jobResponsibilitiesEn: 'Prepare interactive lessons and track student performance.',
    noticePeriod: 30,
    noticePeriodDate: '2024-01-15',
    advertisementStartDate: '2024-01-01',
    advertisementEndDate: '2024-02-01',
    nationality: 1,
    salary: 6000,
    minimumSalary: 5500,
    maximumSalary: 7500,
    teacherGender: 0,
    yearsExperience: 5,
    workShedule: JobType.PARTTIME,
    workStartTime: '08:00',
    workEndTime: '15:00',
    lkAdministrativePositionId: 'admin-role-1',
    lkTeacherLevelId: 'teacher-level-1',
    jobAdvertismentTechnicalSkillsDto: [{ technicalAppName: 'Google Classroom' }],
    jobAdvertismentPersonalSkillsDto: [{ personalSkillName: 'Leadership' }],
    jobAdvertismentMaterialDto: [{ materialId: 'subject-math' }],
    jobAdvertisementCountryDto: [{ lkCountryId: 'country-eg' }],
    jobAdvertisementQualificationDto: [{ lkQualificationId: 'qualification-1' }],
    jobAdvertisementSchoolStageDto: [{ lkSchoolStageId: 'stage-primary' }],
    jobAdvertisementLanguageDto: [{ lkLanguageId: 'lang-ar', lkLanguageLevelId: 'advanced' }],
    jobAdvertisementJobBenefitDto: [{ lkJobBenefitId: 'benefit-health' }],
    jobGradeNameAr: 'معلم أول',
    jobGradeNameEn: 'Senior Teacher',
    jobTypeNameAr: 'معلم',
    jobTypeNameEn: 'Teacher',
    subjectNameAr: 'الرياضيات',
    subjectNameEn: 'Mathematics',
    countryNameAr: 'مصر',
    countryNameEn: 'Egypt',
    schoolStageNameAr: 'المرحلة الابتدائية',
    schoolStageNameEn: 'Primary Stage',
    qualificationNameAr: 'بكالوريوس تربية',
    qualificationNameEn: 'B.Ed in Math',
    applicantsCount: 42,
  },
  {
    id: 'demo-2',
    name: 'مشرف علوم',
    nameEn: 'Science Supervisor',
    schoolBranchId: 'branch-2',
    qualificationType: 2,
    materialId: 'subject-science',
    jobDescription: 'Oversee science curriculum and coordinate lab work.',
    jobDescriptionEn: 'Oversee science curriculum and coordinate lab work.',
    jobResponsibilities: 'قيادة فرق معلمي العلوم وتخطيط الأنشطة العملية.',
    jobResponsibilitiesEn: 'Lead science teachers and plan practical activities.',
    noticePeriod: 45,
    noticePeriodDate: '2024-03-01',
    advertisementStartDate: '2024-02-15',
    advertisementEndDate: '2024-03-30',
    nationality: 2,
    salary: 8000,
    minimumSalary: 7500,
    maximumSalary: 9500,
    teacherGender: 1,
    yearsExperience: 8,
    workShedule: JobType.FULLTIME,
    workStartTime: '09:00',
    workEndTime: '16:30',
    lkAdministrativePositionId: 'admin-role-2',
    lkTeacherLevelId: 'teacher-level-2',
    jobAdvertismentTechnicalSkillsDto: [{ technicalAppName: 'Labster' }],
    jobAdvertismentPersonalSkillsDto: [{ personalSkillName: 'Coaching' }],
    jobAdvertismentMaterialDto: [{ materialId: 'subject-science' }],
    jobAdvertisementCountryDto: [{ lkCountryId: 'country-uae' }],
    jobAdvertisementQualificationDto: [{ lkQualificationId: 'qualification-2' }],
    jobAdvertisementSchoolStageDto: [{ lkSchoolStageId: 'stage-middle' }],
    jobAdvertisementLanguageDto: [{ lkLanguageId: 'lang-en', lkLanguageLevelId: 'fluent' }],
    jobAdvertisementJobBenefitDto: [{ lkJobBenefitId: 'benefit-housing' }],
    jobGradeNameAr: 'مشرف أكاديمي',
    jobGradeNameEn: 'Academic Supervisor',
    jobTypeNameAr: 'إداري',
    jobTypeNameEn: 'Administrator',
    subjectNameAr: 'العلوم',
    subjectNameEn: 'Science',
    countryNameAr: 'الإمارات',
    countryNameEn: 'UAE',
    schoolStageNameAr: 'المرحلة المتوسطة',
    schoolStageNameEn: 'Middle Stage',
    qualificationNameAr: 'ماجستير علوم',
    qualificationNameEn: 'M.Sc in Education',
    applicantsCount: 18,
  },
  {
    id: 'demo-3',
    name: 'منسق لغة إنجليزية',
    nameEn: 'English Language Coordinator',
    schoolBranchId: 'branch-3',
    qualificationType: 3,
    materialId: 'subject-english',
    jobDescription: 'Coordinate ESL initiatives and mentor teachers.',
    jobDescriptionEn: 'Coordinate ESL initiatives and mentor teachers.',
    jobResponsibilities: 'متابعة نتائج الطلاب وتطوير خطط التحسين.',
    jobResponsibilitiesEn: 'Monitor student results and develop improvement plans.',
    noticePeriod: 60,
    noticePeriodDate: '2024-04-10',
    advertisementStartDate: '2024-04-01',
    advertisementEndDate: '2024-05-01',
    nationality: 3,
    salary: 9000,
    minimumSalary: 8500,
    maximumSalary: 11000,
    teacherGender: 0,
    yearsExperience: 10,
    workShedule: JobType.FULLTIME,
    workStartTime: '07:30',
    workEndTime: '14:30',
    lkAdministrativePositionId: 'admin-role-3',
    lkTeacherLevelId: 'teacher-level-3',
    jobAdvertismentTechnicalSkillsDto: [{ technicalAppName: 'Microsoft Teams' }],
    jobAdvertismentPersonalSkillsDto: [{ personalSkillName: 'Communication' }],
    jobAdvertismentMaterialDto: [{ materialId: 'subject-english' }],
    jobAdvertisementCountryDto: [{ lkCountryId: 'country-sa' }, { lkCountryId: 'country-jo' }],
    jobAdvertisementQualificationDto: [{ lkQualificationId: 'qualification-3' }],
    jobAdvertisementSchoolStageDto: [{ lkSchoolStageId: 'stage-high' }],
    jobAdvertisementLanguageDto: [{ lkLanguageId: 'lang-en', lkLanguageLevelId: 'native' }],
    jobAdvertisementJobBenefitDto: [{ lkJobBenefitId: 'benefit-transport' }],
    jobGradeNameAr: 'منسق برامج',
    jobGradeNameEn: 'Program Coordinator',
    jobTypeNameAr: 'معلم',
    jobTypeNameEn: 'Teacher',
    subjectNameAr: 'اللغة الإنجليزية',
    subjectNameEn: 'English',
    countryNameAr: 'السعودية، الأردن',
    countryNameEn: 'Saudi Arabia, Jordan',
    schoolStageNameAr: 'المرحلة الثانوية',
    schoolStageNameEn: 'High School',
    qualificationNameAr: 'دبلوم تربوي',
    qualificationNameEn: 'PGCE',
    applicantsCount: 27,
  },
] as JobAdvertisment[];

const getDynamicValue = (row: JobAdvertisment, keys: string[]): string | undefined => {
  const source = row as Record<string, unknown>;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
};

interface FiltersParams {
  searchTerm: string;
  selectedCountryId: string;
  selectedStageId: string;
  selectedSubjectId: string;
  selectedWorkType: string;
}

const buildFiltersPayload = ({
  searchTerm,
  selectedCountryId,
  selectedStageId,
  selectedSubjectId,
  selectedWorkType,
}: FiltersParams): JobAdvertismentFilters => {
  const workShedule = selectedWorkType ? (Number(selectedWorkType) as JobType) : undefined;

  return {
    searchName: searchTerm || undefined,
    lkCountryId: selectedCountryId || undefined,
    lkSchoolStageId: selectedStageId || undefined,
    materialId: selectedSubjectId || undefined,
    workShedule,
  };
};

export default function JobAnnouncementsList() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
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
    dispatch(fetchSubjects({ page: 1, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    const filtersPayload = buildFiltersPayload({
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
            limit: pagination.limit || 10,
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
    showToast,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCountryId, selectedStageId, selectedSubjectId, selectedWorkType]);

  const countryOptions = Array.isArray(countries)
    ? countries.map((country) => ({
        value: country.id,
        label: currentLang === 'ar' ? country.arabicName : country.englishName,
      }))
    : [];

  const stageOptions = Array.isArray(schoolStages)
    ? schoolStages.map((stage) => ({
        value: stage.id,
        label: currentLang === 'ar' ? stage.nameAr : stage.nameEn,
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

  const workTypeOptions = [
    { value: '', label: t('jobAnnouncement.workType') },
    {
      value: String(JobType.FULLTIME),
      label: t('jobAnnouncement.fullTime'),
    },
    {
      value: String(JobType.PARTTIME),
      label: t('jobAnnouncement.partTime'),
    },
  ];

  const numberLocale = currentLang === 'ar' ? 'ar-EG' : 'en-US';
  const joinSeparator = currentLang === 'ar' ? '، ' : ', ';

  const hasActiveFilters = Boolean(
    searchTerm || selectedCountryId || selectedStageId || selectedSubjectId || selectedWorkType
  );
  const shouldUseDummyData =
    SHOULD_USE_DUMMY_JOB_DATA && jobAdvertisments.length === 0 && !hasActiveFilters;
  const dataSource = shouldUseDummyData ? DUMMY_JOB_ADVERTISMENTS : jobAdvertisments;
  const shouldShowEmptyState =
    !isLoading && jobAdvertisments.length === 0 && !hasActiveFilters && !shouldUseDummyData;
  const shouldShowContent = isLoading || dataSource.length > 0 || hasActiveFilters;
  const tablePagination = shouldUseDummyData
    ? {
        page: 1,
        limit: dataSource.length || 10,
        total: dataSource.length,
        totalPages: 1,
      }
    : {
        page: pagination.page || currentPage,
        limit: pagination.limit || 10,
        total: pagination.total || 0,
        totalPages: pagination.totalPages || 0,
      };

  const handlePageChange = (page: number) => {
    if (shouldUseDummyData) {
      return;
    }
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCountryId('');
    setSelectedStageId('');
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
      header: 'jobAnnouncement.jobGrade',
      accessor: (row) => (
        <span className="text-sm font-medium text-gray-900">
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
        <span className="text-sm text-gray-700">
          {(() => {
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
          {row.workShedule ? (
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                WORK_TYPE_BADGES[row.workShedule]?.bg || 'bg-gray-100 text-gray-700'
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
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsCount',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2 text-sm">
          <span>
            {(() => {
              const value = (row as any).applicantsCount;
              if (typeof value === 'number') {
                return (
                  <div className="flex gap-2">
                    <div className="cursor-pointer">
                      <CustomImage src={EyeStyledIcon} alt="show" className="h-5 w-5" />
                    </div>{' '}
                    {value.toLocaleString()}{' '}
                  </div>
                );
              }
              return '--';
            })()}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.subjectName',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {(() => {
            const fallbackSubjectId =
              row.materialId || row.jobAdvertismentMaterialDto?.[0]?.materialId;
            if (fallbackSubjectId && subjectLabelMap[fallbackSubjectId]) {
              return subjectLabelMap[fallbackSubjectId];
            }
            const dynamicKey = currentLang === 'ar' ? ['subjectNameAr'] : ['subjectNameEn'];
            return getDynamicValue(row, dynamicKey) || '--';
          })()}
        </span>
      ),
      headerClassName: 'min-w-[170px]',
    },
    {
      header: 'jobAnnouncement.country',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {(() => {
            const countryIds =
              row.jobAdvertisementCountryDto?.map((country) => country.lkCountryId) || [];
            if (countryIds.length === 0) {
              const fallbackKey = currentLang === 'ar' ? ['countryNameAr'] : ['countryNameEn'];
              return getDynamicValue(row, fallbackKey) || '--';
            }
            const labels = countryIds.map((id) => countryLabelMap[id]).filter(Boolean);
            if (labels.length === 0) {
              const fallbackKey = currentLang === 'ar' ? ['countryNameAr'] : ['countryNameEn'];
              return getDynamicValue(row, fallbackKey) || '--';
            }
            return labels.join(joinSeparator);
          })()}
        </span>
      ),
      headerClassName: 'min-w-[170px]',
    },
    {
      header: 'jobAnnouncement.educationalStages',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {(() => {
            const stageIds =
              row.jobAdvertisementSchoolStageDto?.map((stage) => stage.lkSchoolStageId) || [];
            if (stageIds.length === 0) {
              const fallbackKey =
                currentLang === 'ar' ? ['schoolStageNameAr'] : ['schoolStageNameEn'];
              return getDynamicValue(row, fallbackKey) || '--';
            }
            const labels = stageIds.map((id) => stageLabelMap[id]).filter(Boolean);
            if (labels.length === 0) {
              const fallbackKey =
                currentLang === 'ar' ? ['schoolStageNameAr'] : ['schoolStageNameEn'];
              return getDynamicValue(row, fallbackKey) || '--';
            }
            return labels.join(joinSeparator);
          })()}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'jobAnnouncement.academicQualification',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {(() => {
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
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'jobAnnouncement.yearsOfExperience',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {typeof row.yearsExperience === 'number'
            ? row.yearsExperience.toLocaleString(numberLocale)
            : '--'}
        </span>
      ),
      headerClassName: 'min-w-[180px]',
    },
    {
      header: 'jobAnnouncement.salary',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {(() => {
            const hasMin = typeof row.minimumSalary === 'number';
            const hasMax = typeof row.maximumSalary === 'number';
            if (hasMin && hasMax) {
              const min = row.minimumSalary.toLocaleString(numberLocale);
              const max = row.maximumSalary.toLocaleString(numberLocale);
              return `${min} - ${max}`;
            }
            if (typeof row.salary === 'number') {
              return row.salary.toLocaleString(numberLocale);
            }
            return '--';
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
            onClick={() => navigate(`/job-announcements/edit/${row.id}`)}
            ariaLabel={t('actions.edit')}
            disabled={shouldUseDummyData}
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedJobId(row.id);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting || shouldUseDummyData}
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
      placeholder: t('jobAnnouncement.searchTeacherName'),
      value: searchTerm,
      onChange: (value) => setSearchTerm((value as string) ?? ''),
      width: '40%',
    },
    {
      type: 'custom',
      name: 'job-announcements-country',
      placeholder: '',
      value: selectedCountryId,
      onChange: () => {},
      width: '20%',
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
      name: 'job-announcements-stage',
      placeholder: '',
      value: selectedStageId,
      onChange: () => {},
      width: '30%',
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
      name: 'job-announcements-work-type',
      placeholder: '',
      value: selectedWorkType,
      onChange: () => {},
      width: '20%',
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
    {
      type: 'custom',
      name: 'job-announcements-subject',
      placeholder: '',
      value: selectedSubjectId,
      onChange: () => {},
      width: '20%',
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
  ];

  const handleDeleteConfirm = async () => {
    if (!selectedJobId) return;

    try {
      await dispatch(deleteJobAdvertisment(selectedJobId)).unwrap();
      setShowDeletePopup(false);
      showToast({
        type: 'success',
        message: 'jobAnnouncement.announcementDeletedSuccessfully',
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'common.errorOccurred',
      });
      return;
    }

    const filtersPayload = buildFiltersPayload({
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
