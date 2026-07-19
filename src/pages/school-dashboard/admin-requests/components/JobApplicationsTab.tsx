import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import ArchiveIcon from '@gradex/assets/icons/Archive.svg';
import ClockBlueIcon from '@gradex/assets/icons/ClockBlue.svg';
import CheckGreenIcon from '@gradex/assets/icons/CheckGreen.svg';

import {
  WorkType,
  type JobApplicationDto,
  EmployeeApplicationStatus,
} from '../admin-requests.types';
import { fetchJobApplications } from '@/redux/features/teacher-requests/teacherRequestsSlice';
import { fetchQualifications, fetchCountries } from '@/redux/features/lookups/lookupsSlice';
import { editApplicationsJobAdvertisementStatus } from '@/redux/features/applications-job-advertisements/applicationsJobAdvertisementsSlice';
import { JOB_APPLICATION_STATUS } from '@/pages/school-dashboard/job-announcements/components/applicants-data';
import type {
  JobApplicationsQueryParams,
  TeacherWorkSchedule,
} from '@/services/api/types/teacher-requests.types';
import { mapJobApplication } from '../admin-requests.mappers';
import ScheduleInterviewPopup from '../popups/ScheduleInterviewPopup';
import ArchiveConfirmPopup from '../popups/ArchiveConfirmPopup';
import AcceptConfirmPopup from '../popups/AcceptConfirmPopup';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import { getCurrentSchoolBranchId } from '@/lib/auth';

const PAGE_SIZE = 10;

const WORK_TYPE_BADGE: Record<WorkType, string> = {
  [WorkType.Both]: 'bg-violet-100 text-violet-700',
  [WorkType.Full]: 'bg-green-100 text-green-700',
  [WorkType.Part]: 'bg-blue-100 text-blue-700',
};

const WORK_TYPE_LABEL: Record<WorkType, string> = {
  [WorkType.Both]: 'adminRequests.workType.both',
  [WorkType.Full]: 'adminRequests.workType.full',
  [WorkType.Part]: 'adminRequests.workType.part',
};

const JobApplicationsTab: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const navigate = useNavigate();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const currentSchoolBranchId = getCurrentSchoolBranchId();

  const { jobApplications, jobApplicationsPagination, isJobApplicationsLoading } = useAppSelector(
    (state) => state.teacherRequests
  );

  const { qualifications, isLoadingQualifications, countries, isLoadingCountries } = useAppSelector(
    (state) => state.lookups
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedQualification, setSelectedQualification] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [page, setPage] = useState(1);

  const [scheduleTarget, setScheduleTarget] = useState<JobApplicationDto | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<JobApplicationDto | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<JobApplicationDto | null>(null);

  // Server-side fetch: re-run whenever paging or filters change, and after actions.
  const loadApplications = useCallback(() => {
    const params: JobApplicationsQueryParams = {
      PageNumber: page,
      PageSize: PAGE_SIZE,
      TeacherName: searchTerm || undefined,
      WorkShedule: selectedWorkType ? (Number(selectedWorkType) as TeacherWorkSchedule) : undefined,
      YearsExperience: selectedExperience ? Number(selectedExperience) : undefined,
      // TODO(api): QualificationId/NationalityId expect lookup IDs — switch these
      // filter options to lookup-based values once lookups are wired.
      QualificationId: selectedQualification || undefined,
      NationalityId: selectedNationality || undefined,
    };
    dispatch(fetchJobApplications(params));
  }, [
    dispatch,
    page,
    searchTerm,
    selectedWorkType,
    selectedQualification,
    selectedExperience,
    selectedNationality,
  ]);

  useEffect(() => {
    if (isActive) {
      loadApplications();
    }
  }, [isActive, loadApplications]);

  const data = useMemo(() => jobApplications.map(mapJobApplication), [jobApplications]);

  const qualificationOptions = useMemo(
    () =>
      Array.isArray(qualifications)
        ? qualifications.map((qualification) => ({
            value: qualification.id,
            label: currentLang === 'ar' ? qualification.nameAr : qualification.nameEn,
          }))
        : [],
    [qualifications, currentLang]
  );

  const experienceOptions = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => i).map((value) => ({
        value: String(value),
        label: String(value),
      })),
    []
  );

  const nationalityOptions = useMemo(
    () =>
      Array.isArray(countries)
        ? countries.map((country) => ({
            value: country.id,
            label: currentLang === 'ar' ? country.arabicName : country.englishName,
          }))
        : [],
    [countries, currentLang]
  );

  const updateStatus = async (
    id: string,
    applicationStatus: number,
    successKey: string
  ): Promise<boolean> => {
    try {
      const result = await dispatch(
        editApplicationsJobAdvertisementStatus({
          applicationsJobAdvertisementId: id,
          applicationStatus,
        })
      )
        .unwrap()
        .then((res: any) => {
          if (res?.isSuccess) {
            showToast({ message: t(successKey), type: 'success' });
            loadApplications();
            return true;
          } else {
            const message = res?.message || t('common.error');
            showToast({ message, type: 'error' });
            return false;
          }
        });
      return result;
    } catch {
      showToast({ message: t('common.error'), type: 'error' });
      return false;
    }
  };

  const handleAcceptConfirm = async () => {
    if (!acceptTarget) return;
    const success = await updateStatus(
      acceptTarget.id,
      JOB_APPLICATION_STATUS.ACCEPT,
      'adminRequests.jobApplication.toasts.accepted'
    );
    if (success) setAcceptTarget(null);
  };

  const handleScheduleConfirm = () => {
    if (!scheduleTarget) return;
    updateStatus(
      scheduleTarget.id,
      JOB_APPLICATION_STATUS.INTERVIEW_SCHEDULED,
      'adminRequests.jobApplication.toasts.scheduled'
    ).then((success) => {
      if (success) setScheduleTarget(null);
    });
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    const success = await updateStatus(
      archiveTarget.id,
      JOB_APPLICATION_STATUS.ARCHIVED,
      'adminRequests.jobApplication.toasts.archived'
    );
    if (success) setArchiveTarget(null);
  };

  const columns: DataTableColumn<JobApplicationDto>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(index || 0) + 1 + (page - 1) * PAGE_SIZE}
        </span>
      ),
      headerClassName: 'w-[50px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.announcement',
      accessor: (row) => <span className="text-gray-700">{row.announcementName}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.applicantName',
      accessor: (row) => (
        <UserAvatarName
          name={row.applicantName}
          avatarSrc={row.teacherPictureProfilePath ?? row.applicantAvatarPath}
          align="between"
          onView={() => navigate(`/admin-requests/job-application/${row.id}`)}
        />
      ),
      headerClassName: 'min-w-[260px]',
      className: 'min-w-[260px]',
    },
    {
      header: 'adminRequests.jobApplication.columns.cv',
      accessor: (row) => (
        <div className="flex justify-center">
          <button
            type="button"
            aria-label={t('adminRequests.jobApplication.columns.cv')}
            onClick={() => row.cvUrl && window.open(row.cvUrl, '_blank', 'noopener')}
            className="transition-opacity hover:opacity-80"
          >
            <CustomImage src={PdfIcon} alt="" className="h-8 w-8" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.workType',
      accessor: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${WORK_TYPE_BADGE[row.workType]}`}
        >
          {t(WORK_TYPE_LABEL[row.workType])}
        </span>
      ),
      headerClassName: 'min-w-[130px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.qualification',
      accessor: (row) => <span className="text-gray-700">{row.qualification}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.experienceYears',
      accessor: (row) => <span className="text-gray-700">{row.experienceYears}</span>,
      headerClassName: 'min-w-[200px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.country',
      accessor: (row) => <span className="text-gray-700">{row.country}</span>,
      headerClassName: 'min-w-[100px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.nationality',
      accessor: (row) => <span className="text-gray-700">{row.nationality}</span>,
      headerClassName: 'min-w-[110px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.address',
      accessor: (row) => <span className="text-gray-700">{row.address}</span>,
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
    },
    {
      header: 'adminRequests.jobApplication.columns.contact',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-4">
          {row.phone && (
            <a
              href={`tel:${row.phone}`}
              aria-label={row.phone}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#56CA971A] hover:bg-green-200"
            >
              <CustomImage src={WhatsAppIcon} alt="Phone" className="h-4 w-4" />
            </a>
          )}
          {row.email && (
            <a
              href={`mailto:${row.email}`}
              aria-label={row.email}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-yellow-100 hover:bg-orange-200"
            >
              <CustomImage src={EmailYellowIcon} alt="Email" className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const isAccepted = row.status === EmployeeApplicationStatus.Accept;
        const isArchived = row.status === EmployeeApplicationStatus.Archived;
        const isInterviewScheduled = row.status === EmployeeApplicationStatus.InterviewScheduled;

        const showAcceptButton = !isAccepted;
        const showScheduleButton = !isAccepted && !isArchived && !isInterviewScheduled;
        const showArchiveButton = !isAccepted && !isArchived;

        if (!showAcceptButton && !showScheduleButton && !showArchiveButton) {
          return (
            <>
              <IconButton
                variant="blue"
                ariaLabel={t('common.view')}
                imgClassName="h-5 w-5"
                onClick={() => navigate(`/admin-requests/job-application/${row.id}`)}
              >
                <CustomImage src={EyeStyledIcon} alt="" className="h-6 w-6" />
              </IconButton>
            </>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2">
            {showAcceptButton && (
              <IconButton
                variant="success"
                ariaLabel={t('adminRequests.jobApplication.actions.accept')}
                imgClassName="h-5 w-5"
                onClick={() => setAcceptTarget(row)}
              >
                <CustomImage src={CheckGreenIcon} alt="" className="h-5 w-5" />
              </IconButton>
            )}

            {showScheduleButton && (
              <IconButton
                variant="blue"
                ariaLabel={t('adminRequests.jobApplication.actions.schedule')}
                imgClassName="h-5 w-5"
                onClick={() => setScheduleTarget(row)}
              >
                <CustomImage src={ClockBlueIcon} alt="" className="h-5 w-5" />
              </IconButton>
            )}

            {showArchiveButton && (
              <IconButton
                variant="yellow"
                ariaLabel={t('adminRequests.jobApplication.actions.archive')}
                imgClassName="h-5 w-5"
                onClick={() => setArchiveTarget(row)}
              >
                <CustomImage src={ArchiveIcon} alt="" className="h-5 w-5" />
              </IconButton>
            )}
          </div>
        );
      },
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('adminRequests.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '30%',
    },
    {
      type: 'custom',
      name: 'work-type-filter',
      value: selectedWorkType,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedWorkType}
          onChange={(value) => {
            setSelectedWorkType(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={[
            { value: String(WorkType.Full), label: t('adminRequests.workType.full') },
            { value: String(WorkType.Part), label: t('adminRequests.workType.part') },
            { value: String(WorkType.Both), label: t('adminRequests.workType.both') },
          ]}
          placeholder={t('adminRequests.filters.workType')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'qualification-filter',
      value: selectedQualification,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedQualification}
          onChange={(value) => {
            setSelectedQualification(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={qualificationOptions}
          placeholder={
            isLoadingQualifications ? t('common.loading') : t('adminRequests.filters.qualification')
          }
          showSearch={false}
          disabled={isLoadingQualifications}
        />
      ),
    },
    {
      type: 'custom',
      name: 'experience-filter',
      value: selectedExperience,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedExperience}
          onChange={(value) => {
            setSelectedExperience(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={experienceOptions}
          placeholder={t('adminRequests.filters.experience')}
          showSearch={false}
        />
      ),
    },
    {
      type: 'custom',
      name: 'nationality-filter',
      value: selectedNationality,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedNationality}
          onChange={(value) => {
            setSelectedNationality(Array.isArray(value) ? (value[0] ?? '') : (value as string));
            setPage(1);
          }}
          options={nationalityOptions}
          placeholder={
            isLoadingCountries ? t('common.loading') : t('adminRequests.filters.nationality')
          }
          showSearch={false}
          disabled={isLoadingCountries}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedWorkType('');
    setSelectedQualification('');
    setSelectedExperience('');
    setSelectedNationality('');
    setPage(1);
  };

  return (
    <Card className="rounded-2xl" padding="lg">
      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        pagination={{
          page: jobApplicationsPagination.page,
          limit: jobApplicationsPagination.limit,
          total: jobApplicationsPagination.total,
          totalPages: jobApplicationsPagination.totalPages,
        }}
        onPageChange={setPage}
        onResetFilters={handleResetFilters}
        emptyMessage="adminRequests.empty"
        isLoading={isJobApplicationsLoading}
        t={t}
      />

      <ScheduleInterviewPopup
        isOpen={Boolean(scheduleTarget)}
        onClose={() => setScheduleTarget(null)}
        onConfirm={handleScheduleConfirm}
        schoolBranchesId={currentSchoolBranchId}
        jobAdvertisementId={scheduleTarget?.jobAdvertismentId}
        teacherId={scheduleTarget?.teacherId}
        supervisorId={scheduleTarget?.supervisorId}
      />

      <ArchiveConfirmPopup
        open={Boolean(archiveTarget)}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
      />

      <AcceptConfirmPopup
        open={Boolean(acceptTarget)}
        onConfirm={handleAcceptConfirm}
        onCancel={() => setAcceptTarget(null)}
      />
    </Card>
  );
};

export default JobApplicationsTab;
