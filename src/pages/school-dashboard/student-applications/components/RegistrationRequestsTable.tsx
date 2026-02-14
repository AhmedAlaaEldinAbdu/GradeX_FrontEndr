import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import Card from '@gradex/shared/components/Card';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import FilesIcon from '@gradex/assets/icons/Files.svg';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import StudentIcon from '@gradex/assets/icons/Student.svg';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentApplications } from '@/redux/features/student-applications/studentApplicationsSlice';
import type { StudentApplicationDto } from '@/services/api/student-applications/student-applications.types';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import useLanguage from '@/hooks/useLanguage';
import ScheduleStudentAppointmentPopup from '../popups/ScheduleStudentAppointmentPopup';
import type { ScheduleAppointmentFormProps } from '@/validations/student-applications-validations';

import AcceptModal from './AcceptModal';
import EditRequestModal from './EditRequestModal';
import NotPassedModal from './NotPassedModal';

const RegistrationRequestsTable: React.FC = () => {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<StudentApplicationDto | null>(
    null
  );

  // Modal state
  const [isAcceptModalOpen, setAcceptModalOpen] = useState(false);
  const [isEditRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [isNotPassedModalOpen, setNotPassedModalOpen] = useState(false);

  // Redux State
  const { applications, pagination, isLoading } = useAppSelector(
    (state) => state.studentApplications
  );
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);

  useEffect(() => {
    dispatch(getEducationalStages({ pageIndex: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStudentApplications({
        page: pagination.pageIndex,
        limit: pagination.pageSize,
        searchTerm: searchTerm || undefined,
        status: selectedStatus ? Number(selectedStatus) : undefined,
        educationalStageId: selectedStageId || undefined,
      })
    );
  }, [
    dispatch,
    pagination.pageIndex,
    pagination.pageSize,
    searchTerm,
    selectedStageId,
    selectedStatus,
  ]);

  // Action handlers
  const handleAccept = (row: StudentApplicationDto) => {
    setSelectedApplication(row);
    setAcceptModalOpen(true);
  };

  const handleEditRequest = (row: StudentApplicationDto) => {
    setSelectedApplication(row);
    setEditRequestModalOpen(true);
  };

  const handleScheduleAppointment = (application: StudentApplicationDto) => {
    setSelectedApplication(application);
    setShowSchedulePopup(true);
  };

  const handleNotPassed = (row: StudentApplicationDto) => {
    setSelectedApplication(row);
    setNotPassedModalOpen(true);
  };

  // Modal confirm handlers
  const handleAcceptConfirm = (contractFile?: File) => {
    console.log('Accept confirmed', selectedApplication?.id, contractFile);
    setAcceptModalOpen(false);
    setSelectedApplication(null);
    // TODO: Call API
  };

  const handleEditRequestConfirm = (message: string) => {
    console.log('Edit request sent', selectedApplication?.id, message);
    setEditRequestModalOpen(false);
    setSelectedApplication(null);
    // TODO: Call API
  };

  const handleNotPassedConfirm = (reason: string) => {
    console.log('Not passed confirmed', selectedApplication?.id, reason);
    setNotPassedModalOpen(false);
    setSelectedApplication(null);
    // TODO: Call API
  };

  const handleScheduleSubmit = async (values: ScheduleAppointmentFormProps) => {
    try {
      // TODO: Implement API call when endpoint is available
      console.log('Schedule appointment:', {
        applicationId: selectedApplication?.id,
        ...values,
      });
      // Show success message
      alert(t('studentApplications.appointmentScheduled'));
      setShowSchedulePopup(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      alert('Failed to schedule appointment');
    }
  };

  const getStatusBadge = (status: StudentApplicationStatus) => {
    switch (status) {
      case StudentApplicationStatus.Completed:
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {t('studentApplications.status.completed')}
          </span>
        );
      case StudentApplicationStatus.NotPassed:
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {t('studentApplications.status.notPassed')}
          </span>
        );
      case StudentApplicationStatus.WaitingForSignature:
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
            {t('studentApplications.status.waitingInterview')}
          </span>
        );
      case StudentApplicationStatus.EditRequested:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            {t('studentApplications.status.editRequested')}
          </span>
        );
      case StudentApplicationStatus.Modified:
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
            {t('studentApplications.status.modified')}
          </span>
        );
      default:
        return null;
    }
  };

  const columns: DataTableColumn<StudentApplicationDto>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">{(index || 0) + 1}</span>
      ),
      headerClassName: 'w-[50px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentManagement.studentName',
      accessor: (row) => {
        const fullName = `${row.firstName} ${row.secondName} ${row.thirdName} ${row.fourthName}`;
        return (
          <div className="flex items-center gap-3">
            <CustomImage
              src={row.studentPhotoPath ? `${baseUrl}/${row.studentPhotoPath}` : ''}
              fallbackSrc={StudentIcon}
              alt={fullName}
              className="h-10 w-10 rounded-full border border-gray-100 object-cover"
            />
            <span className="max-w-[200px] truncate font-medium text-gray-900" title={fullName}>
              {fullName}
            </span>
            <IconButton
              variant="blue"
              ariaLabel="View"
              onClick={() => navigate(`/student-applications/${row.id}`)}
              className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
            >
              <CustomImage src={EyeStyledIcon} alt="View" className="h-5 w-5" />
            </IconButton>
          </div>
        );
      },
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'studentApplications.educationalStage',
      accessor: (row) => <span>{row.lkSchoolStageNameAr || row.lkSchoolStageNameEn || '-'}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.status',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.previousSchool',
      accessor: (row) => <span>{row.previousSchoolName || '-'}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.applicationDate',
      accessor: (row) => <span>{new Date(row.created).toLocaleDateString()}</span>,
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.parentId',
      accessor: (row) => (
        <div className="flex justify-center">
          {row.guardianIdentityPath ? (
            <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
          ) : (
            '-'
          )}
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center w-[120px]',
    },
    {
      header: 'studentApplications.vaccinationCertificate',
      accessor: (row) => (
        <div className="flex justify-center">
          {row.vaccinationCertificatePath ? (
            <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
          ) : (
            '-'
          )}
        </div>
      ),
      headerClassName: 'min-w-[120px] text-center',
      className: 'text-center w-[120px]',
    },
    {
      header: 'studentApplications.lastEducationalCertificate',
      accessor: (row) => (
        <div className="flex justify-center">
          {row.lastEducationCertificatePath ? (
            <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
          ) : (
            '-'
          )}
        </div>
      ),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center w-[150px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => {
        const actions: Action[] = [
          {
            id: 'accept',
            label: t('studentApplications.actions.accept'),
            icon: CheckmarkCircleIcon,
            onClick: () => handleAccept(row),
          },
          {
            id: 'editRequest',
            label: t('studentApplications.actions.sendEditRequest'),
            icon: FilesIcon,
            onClick: () => handleEditRequest(row),
          },
          {
            id: 'schedule',
            label: t('studentApplications.actions.scheduleAppointment'),
            icon: CalendarIcon,
            onClick: () => handleScheduleAppointment(row),
          },
          {
            id: 'notPassed',
            label: t('studentApplications.actions.notPassed'),
            icon: XMarkDangerIcon,
            onClick: () => handleNotPassed(row),
          },
        ];

        return (
          <div className="flex items-center justify-center gap-2">
            <ActionsDropdown actions={actions} />
          </div>
        );
      },
      headerClassName: 'min-w-[100px] text-center',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'search',
      placeholder: t('studentApplications.searchPlaceholder'),
      value: searchTerm,
      onChange: (value) => setSearchTerm(value as string),
      width: '25%',
    },
    {
      type: 'custom',
      name: 'stage-filter',
      value: selectedStageId,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStageId}
          onChange={(value) =>
            setSelectedStageId(Array.isArray(value) ? (value[0] ?? '') : (value as string))
          }
          options={educationalStages.map((stage) => ({
            value: stage.id,
            label: (isArabic && stage.nameAr) || stage.nameEn || '',
          }))}
          placeholder={t('studentApplications.educationalStage')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'status-filter',
      value: selectedStatus,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) =>
            setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : (value as string))
          }
          options={[
            {
              value: StudentApplicationStatus.EditRequested.toString(),
              label: t('studentApplications.status.editRequested'),
            },
            {
              value: StudentApplicationStatus.Completed.toString(),
              label: t('studentApplications.status.completed'),
            },
            {
              value: StudentApplicationStatus.NotPassed.toString(),
              label: t('studentApplications.status.notPassed'),
            },
            {
              value: StudentApplicationStatus.WaitingForSignature.toString(),
              label: t('studentApplications.status.waitingInterview'),
            },
            {
              value: StudentApplicationStatus.Modified.toString(),
              label: t('studentApplications.status.modified'),
            },
          ]}
          placeholder={t('common.status')}
        />
      ),
    },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStageId('');
    setSelectedStatus('');
  };

  return (
    <Card>
      <DataTable
        data={applications}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        pagination={{
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          total: pagination.totalItems,
          totalPages: pagination.totalPages,
        }}
        onPageChange={(newPage) =>
          dispatch(fetchStudentApplications({ page: newPage, limit: pagination.pageSize }))
        }
        onResetFilters={handleResetFilters}
        t={t}
        isLoading={isLoading}
      />

      {/* Schedule Appointment Popup */}
      <ScheduleStudentAppointmentPopup
        isOpen={showSchedulePopup}
        onClose={() => {
          setShowSchedulePopup(false);
          setSelectedApplication(null);
        }}
        onSubmit={handleScheduleSubmit}
        studentName={
          selectedApplication
            ? `${selectedApplication.firstName} ${selectedApplication.secondName} ${selectedApplication.thirdName} ${selectedApplication.fourthName}`
            : undefined
        }
      />

      {/* Action Modals */}
      <AcceptModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          setAcceptModalOpen(false);
          setSelectedApplication(null);
        }}
        onConfirm={handleAcceptConfirm}
      />
      <EditRequestModal
        isOpen={isEditRequestModalOpen}
        onClose={() => {
          setEditRequestModalOpen(false);
          setSelectedApplication(null);
        }}
        onConfirm={handleEditRequestConfirm}
      />
      <NotPassedModal
        isOpen={isNotPassedModalOpen}
        onClose={() => {
          setNotPassedModalOpen(false);
          setSelectedApplication(null);
        }}
        onConfirm={handleNotPassedConfirm}
      />
    </Card>
  );
};

export default RegistrationRequestsTable;
