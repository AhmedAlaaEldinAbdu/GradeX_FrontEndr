import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@/shared/components/Card';
import CustomSelect from '@/shared/components/CustomSelect';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
// import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import RestoreBlueIcon from '@gradex/assets/icons/RestoreBlue.svg';

import { WorkType, type JobApplicationDto } from '../admin-requests.types';
import { fetchJobApplications } from '@/redux/features/teacher-requests/teacherRequestsSlice';
import type {
  JobApplicationsQueryParams,
  TeacherWorkSchedule,
} from '@/services/api/types/teacher-requests.types';
import { mapJobApplication } from '../admin-requests.mappers';
import RestoreApplicationFromArchivePopup from '../popups/RestoreApplicationFromArchivePopup';
import { JobApplicationStatus } from '@/shared/enums/enums';

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

const ArchiveApplicationsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { jobApplications, jobApplicationsPagination, isJobApplicationsLoading } = useAppSelector(
    (state) => state.teacherRequests
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedQualification, setSelectedQualification] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  const [page, setPage] = useState(1);
  const [isRestorePopupOpen, setRestorePopupOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [selectedApplicationName, setSelectedApplicationName] = useState<string>('');

  const loadApplications = useCallback(() => {
    const params: JobApplicationsQueryParams = {
      PageNumber: page,
      PageSize: PAGE_SIZE,
      TeacherName: searchTerm || undefined,
      WorkShedule: selectedWorkType ? (Number(selectedWorkType) as TeacherWorkSchedule) : undefined,
      YearsExperience: selectedExperience ? Number(selectedExperience) : undefined,
      QualificationId: selectedQualification || undefined,
      NationalityId: selectedNationality || undefined,
      ApplicationStatus: JobApplicationStatus.Archived, // Archived status
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
    loadApplications();
  }, [loadApplications]);

  const data = useMemo(() => jobApplications.map(mapJobApplication), [jobApplications]);

  const qualificationOptions = useMemo(
    () =>
      Array.from(new Set(data.map((row) => row.qualification).filter(Boolean))).map((value) => ({
        value,
        label: value,
      })),
    [data]
  );

  const experienceOptions = useMemo(
    () =>
      Array.from(new Set(data.map((row) => row.experienceYears)))
        .sort((a, b) => a - b)
        .map((value) => ({ value: String(value), label: String(value) })),
    [data]
  );

  const nationalityOptions = useMemo(
    () =>
      Array.from(new Set(data.map((row) => row.nationality).filter(Boolean))).map((value) => ({
        value,
        label: value,
      })),
    [data]
  );

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
      header: 'adminRequests.jobApplication.columns.nationality',
      accessor: (row) => <span className="text-gray-700">{row.nationality}</span>,
      headerClassName: 'min-w-[110px] text-center',
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
      accessor: (row) => (
        <IconButton
          variant="blue"
          ariaLabel={t('common.restore')}
          imgClassName="h-5 w-5"
          onClick={() => {
            setSelectedApplicationId(row.id);
            setSelectedApplicationName(row.applicantName);
            setRestorePopupOpen(true);
          }}
        >
          <CustomImage src={RestoreBlueIcon} alt="" className="h-6 w-6" />
        </IconButton>
      ),
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
          placeholder={t('adminRequests.filters.qualification')}
          showSearch={false}
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
          placeholder={t('adminRequests.filters.nationality')}
          showSearch={false}
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

  const handleRestoreConfirm = () => {
    // API call to restore application will go here
    setRestorePopupOpen(false);
    loadApplications();
  };

  return (
    <>
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
      </Card>

      <RestoreApplicationFromArchivePopup
        isOpen={isRestorePopupOpen}
        onClose={() => setRestorePopupOpen(false)}
        onConfirm={handleRestoreConfirm}
        applicationName={selectedApplicationName}
        applicationId={selectedApplicationId}
      />
    </>
  );
};

export default ArchiveApplicationsTab;
