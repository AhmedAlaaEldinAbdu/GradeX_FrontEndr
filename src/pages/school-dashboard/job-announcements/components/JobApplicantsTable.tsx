import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import CustomSelect from '@/shared/components/CustomSelect';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import ArchiveIcon from '@gradex/assets/icons/Archive.svg';
import RecallIcon from '@gradex/assets/icons/Recall.svg';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import TimeLog from '@gradex/assets/icons/TimeLog.svg';
import EmailContactIcon from '@gradex/assets/icons/EmailYellow.svg';
import PhoneContactIcon from '@gradex/assets/icons/PhoneGreen.svg';
import { WORK_TYPE_BADGES, JOB_APPLICATION_STATUS } from './applicants-data';
import CustomImage from '@/shared/components/CustomImage';
import { useToast } from '@/shared/context/ToastContext';
import ArchiveApplicantPopup from '../popups/ArchiveApplicantPopup';
import ScheduleInterviewPopup, {
  type ScheduleInterviewFormData,
} from '../popups/ScheduleInterviewPopup';
import AcceptApplicantPopup from '../popups/AcceptApplicantPopup';
import IconButton from '@/shared/components/IconButton';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchApplicationsJobAdvertisements,
  editApplicationsJobAdvertisementStatus,
} from '@/redux/features/applications-job-advertisements/applicationsJobAdvertisementsSlice';
import { fetchQualifications, fetchCountries } from '@/redux/features/lookups/lookupsSlice';
import type { ApplicationsJobAdvertisement } from '@/services/api/types/applications-job-advertisement.types';

type JobApplicantsTableProps = {
  jobAdvertisementId: string;
  applicationStatus: number;
  filterPrefix: string;
  isArchived?: boolean;
};

const PAGE_SIZE = 10;

const JobApplicantsTable = ({
  jobAdvertisementId,
  applicationStatus,
  filterPrefix,
  isArchived = false,
}: JobApplicantsTableProps) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { applications, pagination, isLoading } = useAppSelector(
    (state) => state.applicationsJobAdvertisements
  );
  const {
    qualifications,
    countries,
    isQualificationsInitialized,
    isCountriesInitialized,
    isLoadingQualifications,
    isLoadingCountries,
  } = useAppSelector((state) => state.lookups);
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const numberLocale = currentLang === 'ar' ? 'ar-SA' : 'en-US';
  const emailLabel = t('common.email', { defaultValue: 'Email' });
  const phoneLabel = t('common.phone', { defaultValue: 'Phone' });

  // Filter state
  const [searchValue, setSearchValue] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = PAGE_SIZE;

  const [archivePopupOpen, setArchivePopupOpen] = useState(false);
  const [schedulePopupOpen, setSchedulePopupOpen] = useState(false);
  const [acceptPopupOpen, setAcceptPopupOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationsJobAdvertisement | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [jobAdvertisementId, applicationStatus]);

  const fetchApplicants = useCallback(() => {
    if (!jobAdvertisementId) {
      return;
    }

    dispatch(
      fetchApplicationsJobAdvertisements({
        page: currentPage,
        limit: pageSize,
        filters: {
          jobAdvertisementId,
          applicationStatus,
          search: searchValue.trim() || undefined,
          workShedule: workTypeFilter ? Number(workTypeFilter) : undefined,
          lkQualificationId: qualificationFilter || undefined,
          nationalityId: nationalityFilter || undefined,
          experienceYears: experienceFilter ? Number(experienceFilter) : undefined,
        },
      })
    );
  }, [
    applicationStatus,
    currentPage,
    dispatch,
    experienceFilter,
    jobAdvertisementId,
    nationalityFilter,
    pageSize,
    qualificationFilter,
    searchValue,
    workTypeFilter,
  ]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  useEffect(() => {
    if (!qualifications.length && !isQualificationsInitialized && !isLoadingQualifications) {
      dispatch(fetchQualifications());
    }
  }, [dispatch, isQualificationsInitialized, isLoadingQualifications, qualifications.length]);

  useEffect(() => {
    if (!countries.length && !isCountriesInitialized && !isLoadingCountries) {
      dispatch(fetchCountries());
    }
  }, [dispatch, isCountriesInitialized, isLoadingCountries, countries.length]);

  const updateApplicantStatus = useCallback(
    async ({
      applicant,
      nextStatus,
      successMessageKey,
    }: {
      applicant: ApplicationsJobAdvertisement | null;
      nextStatus: number;
      successMessageKey: string;
    }) => {
      if (!applicant) {
        showToast({ message: 'common.errorOccurred', type: 'error' });
        return false;
      }

      try {
        setIsProcessing(true);
        await dispatch(
          editApplicationsJobAdvertisementStatus({
            applicationsJobAdvertisementId: applicant.id,
            applicationStatus: nextStatus,
          })
        ).unwrap();
        showToast({ message: successMessageKey, type: 'success' });
        fetchApplicants();
        return true;
      } catch (error) {
        showToast({ message: 'common.errorOccurred', type: 'error' });
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, fetchApplicants, showToast]
  );

  const startIndex = (currentPage - 1) * pageSize;

  const handlePageChange = (page: number) => setCurrentPage(page);
  const resetFilters = () => {
    setSearchValue('');
    setWorkTypeFilter('');
    setQualificationFilter('');
    setNationalityFilter('');
    setExperienceFilter('');
    setCurrentPage(1);
  };

  // Popup handlers
  const handleOpenArchivePopup = (applicant: ApplicationsJobAdvertisement) => {
    setSelectedApplicant(applicant);
    setArchivePopupOpen(true);
  };

  const handleOpenSchedulePopup = (applicant: ApplicationsJobAdvertisement) => {
    setSelectedApplicant(applicant);
    setSchedulePopupOpen(true);
  };

  const handleOpenAcceptPopup = (applicant: ApplicationsJobAdvertisement) => {
    setSelectedApplicant(applicant);
    setAcceptPopupOpen(true);
  };

  const handleArchiveConfirm = async () => {
    const success = await updateApplicantStatus({
      applicant: selectedApplicant,
      nextStatus: JOB_APPLICATION_STATUS.ARCHIVED,
      successMessageKey: 'jobAnnouncement.applicantsPage.archiveSuccess',
    });

    if (success) {
      setArchivePopupOpen(false);
      setSelectedApplicant(null);
    }
  };

  const handleScheduleSubmit = async (data: ScheduleInterviewFormData) => {
    try {
      setIsProcessing(true);
      // TODO: Add API call to schedule interview
      console.log('Schedule interview data:', data);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulated API call
      showToast({
        message: 'jobAnnouncement.applicantsPage.interviewScheduledSuccess',
        type: 'success',
      });
      setSchedulePopupOpen(false);
      setSelectedApplicant(null);
    } catch (error) {
      showToast({ message: 'common.errorOccurred', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptConfirm = async () => {
    const success = await updateApplicantStatus({
      applicant: selectedApplicant,
      nextStatus: JOB_APPLICATION_STATUS.ACCEPTED,
      successMessageKey: 'jobAnnouncement.applicantsPage.acceptSuccess',
    });

    if (success) {
      setAcceptPopupOpen(false);
      setSelectedApplicant(null);
    }
  };

  const handleRecall = async (applicant: ApplicationsJobAdvertisement) => {
    await updateApplicantStatus({
      applicant,
      nextStatus: JOB_APPLICATION_STATUS.REQUESTS,
      successMessageKey: 'jobAnnouncement.applicantsPage.recallSuccess',
    });
  };

  const workTypeOptions = useMemo(() => {
    const baseOptions = [
      { value: '1', labelKey: 'jobAnnouncement.form.contractFullTime' },
      { value: '2', labelKey: 'jobAnnouncement.form.contractPartTime' },
    ];

    return baseOptions.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));
  }, [t]);

  const qualificationOptions = useMemo(() => {
    const options = qualifications
      .map((qualification) => {
        if (!qualification?.id) {
          return null;
        }
        const label =
          currentLang === 'ar'
            ? qualification.nameAr || qualification.nameEn || ''
            : qualification.nameEn || qualification.nameAr || '';

        if (!label) {
          return null;
        }

        return {
          value: qualification.id,
          label,
        };
      })
      .filter((option): option is { value: string; label: string } => option !== null)
      .sort((a, b) =>
        a.label.localeCompare(b.label, currentLang === 'ar' ? 'ar' : 'en', {
          sensitivity: 'base',
        })
      );

    return options;
  }, [qualifications, currentLang, t]);

  const countryOptions = useMemo(() => {
    const options = countries
      .map((country) => {
        if (!country?.id) {
          return null;
        }

        const label =
          currentLang === 'ar'
            ? country.arabicName || country.englishName || ''
            : country.englishName || country.arabicName || '';

        if (!label) {
          return null;
        }

        return { value: country.id, label };
      })
      .filter((option): option is { value: string; label: string } => option !== null)
      .sort((a, b) =>
        a.label.localeCompare(b.label, currentLang === 'ar' ? 'ar' : 'en', {
          sensitivity: 'base',
        })
      );

    return options;
  }, [countries, currentLang, t]);

  const experienceOptions = useMemo(() => {
    const uniqueSorted = Array.from(new Set(applications.map((item) => item.experienceYears || 0)))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);

    return uniqueSorted.map((value) => ({ value: String(value), label: `${value}` }));
  }, [applications, t]);

  const getApplicantName = (applicant: ApplicationsJobAdvertisement) => applicant.fullName || '';
  const getAddress = (applicant: ApplicationsJobAdvertisement) => applicant.streetName || '-';
  const getNationalityLabel = (applicant: ApplicationsJobAdvertisement) =>
    currentLang === 'ar'
      ? applicant.nationalityNameAr || applicant.nationalityNameEn || ''
      : applicant.nationalityNameEn || applicant.nationalityNameAr || '';
  const getCountryLabel = (applicant: ApplicationsJobAdvertisement) =>
    currentLang === 'ar'
      ? applicant.lKCountryNameAr || applicant.lKCountryNameEn || ''
      : applicant.lKCountryNameEn || applicant.lKCountryNameAr || '';
  const getQualificationLabel = (applicant: ApplicationsJobAdvertisement) => {
    const qualificationDtos = applicant.lKQualificationDtos || applicant.lkQualificationDtos || [];

    if (!qualificationDtos.length) {
      return '-';
    }

    return qualificationDtos
      .map((item) =>
        currentLang === 'ar'
          ? item.lkQualificationNameAr || item.lkQualificationNameEn || ''
          : item.lkQualificationNameEn || item.lkQualificationNameAr || ''
      )
      .filter(Boolean)
      .join(', ');
  };

  const filters: FilterConfig[] = [
    {
      type: 'search',
      name: `${filterPrefix}-applicants-search`,
      placeholder: t('jobAnnouncement.applicantsPage.filters.search'),
      value: searchValue,
      onChange: (value) => {
        setSearchValue(value as string);
        setCurrentPage(1);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: `${filterPrefix}-work-type`,
      value: workTypeFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={workTypeFilter}
          onChange={(value) => {
            setWorkTypeFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={workTypeOptions}
          placeholder={t('jobAnnouncement.workType')}
          maxHeight="180px"
        />
      ),
    },
    {
      type: 'custom',
      name: `${filterPrefix}-qualification`,
      value: qualificationFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={qualificationFilter}
          onChange={(value) => {
            setQualificationFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={qualificationOptions}
          placeholder={t('jobAnnouncement.applicantsPage.filters.qualification')}
          maxHeight="180px"
        />
      ),
    },
    {
      type: 'custom',
      name: `${filterPrefix}-experience`,
      value: experienceFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={experienceFilter}
          onChange={(value) => {
            setExperienceFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={experienceOptions}
          placeholder={t('jobAnnouncement.applicantsPage.filters.experience')}
          maxHeight="180px"
        />
      ),
    },
    {
      type: 'custom',
      name: `${filterPrefix}-nationality`,
      value: nationalityFilter,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={nationalityFilter}
          onChange={(value) => {
            setNationalityFilter(
              Array.isArray(value) ? ((value[0] as string) ?? '') : (value as string)
            );
            setCurrentPage(1);
          }}
          options={countryOptions}
          placeholder={t('jobAnnouncement.applicantsPage.filters.nationality')}
          maxHeight="180px"
        />
      ),
    },
  ];

  const columns: DataTableColumn<ApplicationsJobAdvertisement>[] = [
    {
      header: '#',
      accessor: (_row, index) => startIndex + (index ?? 0) + 1,
      className: 'text-center text-sm text-gray-600',
      headerClassName: 'w-16',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.name',
      accessor: (row) => (
        <div className="flex items-center justify-between gap-3">
          <img
            src={DefaultAvatar}
            alt={getApplicantName(row)}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex items-center">
            <p className="text-sm font-semibold text-gray-900">{getApplicantName(row)}</p>
          </div>
          <div className="flex items-center">
            <IconButton
              variant="default"
              ariaLabel={t('jobAnnouncement.viewApplicants')}
              // TODO: navigate to teacher profile once flow is ready using row.teacherId
              className="h-8 w-8"
            >
              <CustomImage
                src={EyeStyledIcon}
                alt={t('jobAnnouncement.viewApplicants')}
                className="h-4 w-4"
              />
            </IconButton>
          </div>
        </div>
      ),
      headerClassName: 'min-w-[220px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.resume',
      accessor: (row) => (
        <button
          type="button"
          onClick={() =>
            row.resumeFile && window.open(row.resumeFile, '_blank', 'noopener,noreferrer')
          }
          disabled={!row.resumeFile}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-opacity ${
            row.resumeFile ? '' : 'cursor-not-allowed opacity-50'
          }`}
        >
          <CustomImage src={PdfIcon} alt="PDF" className="h-5 w-5" />
        </button>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.workType',
      accessor: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            WORK_TYPE_BADGES[row.workShedule]?.bg || 'bg-gray-100 text-gray-600'
          }`}
        >
          {t(WORK_TYPE_BADGES[row.workShedule]?.label || 'jobAnnouncement.workType')}
        </span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.qualification',
      accessor: (row) => (
        <span className="text-sm text-gray-700">{getQualificationLabel(row)}</span>
      ),
      headerClassName: 'min-w-[160px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.experience',
      accessor: (row) => (
        <span className="text-sm text-gray-700">
          {(row.experienceYears || 0).toLocaleString(numberLocale)}
        </span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.nationality',
      accessor: (row) => <span className="text-sm text-gray-700">{getNationalityLabel(row)}</span>,
      headerClassName: 'min-w-[140px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.country',
      accessor: (row) => <span className="text-sm text-gray-700">{getCountryLabel(row)}</span>,
      headerClassName: 'min-w-[140px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.address',
      accessor: (row) => <span className="text-sm text-gray-700">{getAddress(row)}</span>,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.contact',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <a
            href={row.phoneNumber ? `tel:${row.phoneNumber}` : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 ${
              row.phoneNumber
                ? 'bg-emerald-50 hover:opacity-80'
                : 'pointer-events-none cursor-not-allowed bg-gray-100 opacity-50'
            }`}
            title={row.phoneNumber || phoneLabel}
            aria-label={row.phoneNumber || phoneLabel}
          >
            <CustomImage src={PhoneContactIcon} alt={phoneLabel} className="h-4 w-4" />
          </a>
          <a
            href={row.email ? `mailto:${row.email}` : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${
              row.email
                ? 'bg-orange-50 hover:opacity-80'
                : 'pointer-events-none cursor-not-allowed bg-gray-100 opacity-50'
            }`}
            title={row.email || emailLabel}
            aria-label={row.email || emailLabel}
          >
            <CustomImage src={EmailContactIcon} alt={emailLabel} className="h-4 w-4" />
          </a>
        </div>
      ),
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'jobAnnouncement.applicantsPage.table.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2">
          {isArchived ? (
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
              title={t('actions.recall')}
              onClick={() => handleRecall(row)}
            >
              <CustomImage src={RecallIcon} alt={t('actions.recall')} className="h-4 w-4" />
            </button>
          ) : (
            <>
              {/* Accept/Approve Button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 transition-colors hover:bg-green-200"
                title={t('common.approve')}
                onClick={() => handleOpenAcceptPopup(row)}
              >
                <CustomImage src={CheckIcon} alt={t('common.approve')} className="h-4 w-4" />
              </button>
              {/* Schedule Interview Button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 transition-colors hover:bg-blue-200"
                title={t('jobAnnouncement.applicantsPage.scheduleInterview')}
                onClick={() => handleOpenSchedulePopup(row)}
              >
                <CustomImage
                  src={TimeLog}
                  alt={t('jobAnnouncement.applicantsPage.scheduleInterview')}
                  className="h-4 w-4"
                />
              </button>
              {/* Archive Button */}
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 transition-colors hover:bg-orange-200"
                title={t('actions.archive')}
                onClick={() => handleOpenArchivePopup(row)}
              >
                <CustomImage src={ArchiveIcon} alt={t('actions.archive')} className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
      headerClassName: 'w-[160px]',
      className: 'text-center',
    },
  ];

  const getSelectedApplicantName = () => {
    if (!selectedApplicant) return '';
    return selectedApplicant.fullName || '';
  };

  const tablePagination = {
    page: currentPage,
    limit: pageSize,
    total: pagination.total,
    totalPages: pagination.totalPages || Math.max(1, Math.ceil(pagination.total / pageSize)),
  };

  return (
    <>
      <Card>
        <DataTable
          data={applications}
          columns={columns}
          keyExtractor={(row) => row.id}
          filters={filters}
          showFilters={true}
          onResetFilters={resetFilters}
          pagination={tablePagination}
          onPageChange={handlePageChange}
          emptyMessage={t('jobAnnouncement.applicantsPage.emptyState')}
          isLoading={isLoading}
          t={t}
        />
      </Card>

      {/* Archive Applicant Popup */}
      <ArchiveApplicantPopup
        open={archivePopupOpen}
        applicantName={getSelectedApplicantName()}
        onConfirm={handleArchiveConfirm}
        onCancel={() => {
          setArchivePopupOpen(false);
          setSelectedApplicant(null);
        }}
        isProcessing={isProcessing}
      />

      {/* Schedule Interview Popup */}
      <ScheduleInterviewPopup
        open={schedulePopupOpen}
        applicantName={getSelectedApplicantName()}
        onClose={() => {
          setSchedulePopupOpen(false);
          setSelectedApplicant(null);
        }}
        onSubmit={handleScheduleSubmit}
        isLoading={isProcessing}
      />

      {/* Accept Applicant Popup */}
      <AcceptApplicantPopup
        open={acceptPopupOpen}
        applicantName={getSelectedApplicantName()}
        onConfirm={handleAcceptConfirm}
        onCancel={() => {
          setAcceptPopupOpen(false);
          setSelectedApplicant(null);
        }}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default JobApplicantsTable;
