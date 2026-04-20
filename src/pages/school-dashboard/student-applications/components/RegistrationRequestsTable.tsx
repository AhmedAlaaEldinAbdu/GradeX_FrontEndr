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
// import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import StudentIcon from '@gradex/assets/icons/Student.svg';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchStudentApplications,
  updateStudentApplicationStatus,
  sendEditRequest,
} from '@/redux/features/student-applications/studentApplicationsSlice';
import type { StudentApplicationDto } from '@/services/api/student-applications/student-applications.types';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import useLanguage from '@/hooks/useLanguage';
import ScheduleStudentAppointmentPopup from '../popups/ScheduleStudentAppointmentPopup';
import type { ScheduleAppointmentFormProps } from '@/validations/student-applications-validations';
import { useToast } from '@/shared/context/ToastContext';
import { createStudentInterview } from '@/services/api/student-interviews/student-interviews.service';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

import AcceptModal from './AcceptModal';
import EditRequestModal from './EditRequestModal';
import NotPassedModal from './NotPassedModal';

const RegistrationRequestsTable: React.FC = () => {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const schoolBranchId = getCurrentSchoolBranchId();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
  const handleAcceptConfirm = async () => {
    if (!selectedApplication) return;

    try {
      setIsProcessing(true);
      await dispatch(
        updateStudentApplicationStatus({
          id: selectedApplication.id,
          status: StudentApplicationStatus.Accept,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setAcceptModalOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error(error);
      showToast({
        message: t('common.error'),
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditRequestConfirm = async (message: string) => {
    if (!selectedApplication) return;

    try {
      setIsProcessing(true);
      await dispatch(
        sendEditRequest({
          studentApplicationId: selectedApplication.id,
          editRequest: message,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setEditRequestModalOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error(error);
      showToast({
        message: t('common.error'),
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotPassedConfirm = async () => {
    if (!selectedApplication) return;

    try {
      setIsProcessing(true);
      await dispatch(
        updateStudentApplicationStatus({
          id: selectedApplication.id,
          status: StudentApplicationStatus.Reject,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setNotPassedModalOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error(error);
      showToast({
        message: t('common.error'),
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleSubmit = async (values: ScheduleAppointmentFormProps) => {
    if (!selectedApplication) return;

    try {
      setIsProcessing(true);

      const interviewDate = new Date(
        `${values.appointmentDate}T${values.appointmentTime}:00`
      ).toISOString();

      const startDate = new Date(`${values.appointmentDate}T${values.appointmentTime}:00`);
      const startTime = startDate.toISOString();

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endTime = endDate.toISOString();

      if (!schoolBranchId) {
        throw new Error(t('common.error'));
      }

      await createStudentInterview({
        schoolBranchesId: schoolBranchId,
        studentId: selectedApplication.studentId,
        interviewDate,
        startTime,
        endTime,
      });

      await dispatch(
        updateStudentApplicationStatus({
          id: selectedApplication.id,
          status: StudentApplicationStatus.InterviewScheduled,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.appointmentScheduled'),
        type: 'success',
      });
      setShowSchedulePopup(false);
      setSelectedApplication(null);

      dispatch(
        fetchStudentApplications({
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          searchTerm: searchTerm || undefined,
          status: selectedStatus ? Number(selectedStatus) : undefined,
          educationalStageId: selectedStageId || undefined,
        })
      );
    } catch (error) {
      console.error('Failed to schedule appointment:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: error instanceof Error && errorMessage !== t('common.error'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: StudentApplicationStatus) => {
    switch (status) {
      case StudentApplicationStatus.Accept:
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {t('studentApplications.status.completed')}
          </span>
        );
      case StudentApplicationStatus.Reject:
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            {t('studentApplications.status.notPassed')}
          </span>
        );
      case StudentApplicationStatus.Pending:
        return (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
            {t('studentApplications.status.waitingInterview')}
          </span>
        );
      case StudentApplicationStatus.EditRequest:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            {t('studentApplications.status.editRequested')}
          </span>
        );
      case StudentApplicationStatus.Edited:
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
            {t('studentApplications.status.modified')}
          </span>
        );
      case StudentApplicationStatus.InterviewScheduled:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {t('studentApplications.status.interviewScheduled', {
              defaultValue: 'Interview Scheduled',
            })}
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
        const fullName = `${row.firstName} ${row.secondName} ${row.thirdName}`; // figma not bind fourth name ${row.fourthName};
        return (
          <div className="flex items-center gap-3">
            <CustomImage
              src={row.studentPhotoPath ? `${baseUrl}/${row.studentPhotoPath}` : ''}
              fallbackSrc={StudentIcon}
              alt={fullName}
              className="h-10 w-10 rounded-full border border-gray-100 object-cover"
            />
            <span className="w-full text-start font-medium text-gray-900" title={fullName}>
              {fullName}
            </span>
            <IconButton
              variant="blue"
              ariaLabel="View"
              onClick={() => navigate(`/student-applications/${row.id}`)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
            >
              <CustomImage src={EyeStyledIcon} alt="View" className="h-5 w-5" />
            </IconButton>
          </div>
        );
      },
      headerClassName: 'min-w-[320px]',
      className: 'min-w-[320px]',
    },
    {
      header: 'studentApplications.educationalStage',
      accessor: (row) => <span>{row.lkSchoolStageNameAr || row.lkSchoolStageNameEn || '-'}</span>,
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
    },
    {
      header: 'common.status',
      accessor: (row) => getStatusBadge(row.status),
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.previousSchool',
      accessor: (row) => <span>{row.previousSchoolName || '-'}</span>,
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.applicationDate',
      accessor: (row) => <span>{new Date(row.created).toLocaleDateString()}</span>,
      headerClassName: 'min-w-[140px] text-center',
      className: 'text-center',
    },
    // The following columns are commented out as per the original code, but can be re-enabled if needed
    // {
    //   header: 'studentApplications.parentId',
    //   accessor: (row) => (
    //     <div className="flex justify-center">
    //       {row.guardianIdentityPath ? (
    //         <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
    //       ) : (
    //         '-'
    //       )}
    //     </div>
    //   ),
    //   headerClassName: 'min-w-[140px] text-center',
    //   className: 'text-center w-[140px]',
    // },
    // {
    //   header: 'studentApplications.vaccinationCertificate',
    //   accessor: (row) => (
    //     <div className="flex justify-center">
    //       {row.vaccinationCertificatePath ? (
    //         <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
    //       ) : (
    //         '-'
    //       )}
    //     </div>
    //   ),
    //   headerClassName: 'min-w-[140px] text-center',
    //   className: 'text-center w-[140px]',
    // },
    // {
    //   header: 'studentApplications.lastEducationalCertificate',
    //   accessor: (row) => (
    //     <div className="flex justify-center">
    //       {row.lastEducationCertificatePath ? (
    //         <CustomImage src={PdfIcon} className="h-6 w-6 cursor-pointer" alt="pdf" />
    //       ) : (
    //         '-'
    //       )}
    //     </div>
    //   ),
    //   headerClassName: 'min-w-[180px] text-center',
    //   className: 'text-center w-[180px]',
    // },
    {
      header: 'common.actions',
      accessor: (row) => {
        const actions: Action[] = [];

        if (
          row.status === StudentApplicationStatus.Accept ||
          row.status === StudentApplicationStatus.Reject
        ) {
          return null;
        }

        if (
          row.status === StudentApplicationStatus.EditRequest ||
          row.status === StudentApplicationStatus.Edited ||
          row.status === StudentApplicationStatus.InterviewScheduled
        ) {
          actions.push({
            id: 'accept',
            label: t('studentApplications.actions.accept'),
            icon: CheckmarkCircleIcon,
            onClick: () => handleAccept(row),
          });
          actions.push({
            id: 'notPassed',
            label: t('studentApplications.actions.notPassed'),
            icon: XMarkDangerIcon,
            onClick: () => handleNotPassed(row),
          });
        } else {
          actions.push(
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
            }
          );
        }

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
              value: StudentApplicationStatus.EditRequest.toString(),
              label: t('studentApplications.status.editRequested'),
            },
            {
              value: StudentApplicationStatus.Accept.toString(),
              label: t('studentApplications.status.completed'),
            },
            {
              value: StudentApplicationStatus.Reject.toString(),
              label: t('studentApplications.status.notPassed'),
            },
            {
              value: StudentApplicationStatus.Pending.toString(),
              label: t('studentApplications.status.waitingInterview'),
            },
            {
              value: StudentApplicationStatus.Edited.toString(),
              label: t('studentApplications.status.modified'),
            },
            {
              value: StudentApplicationStatus.InterviewScheduled.toString(),
              label: t('studentApplications.status.interviewScheduled', {
                defaultValue: 'Interview Scheduled',
              }),
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
          if (!isProcessing) {
            setShowSchedulePopup(false);
            setSelectedApplication(null);
          }
        }}
        onSubmit={handleScheduleSubmit}
        studentName={
          selectedApplication
            ? `${selectedApplication.firstName} ${selectedApplication.secondName} ${selectedApplication.thirdName} ${selectedApplication.fourthName}`
            : undefined
        }
        isLoading={isProcessing}
      />

      {/* Action Modals */}
      <AcceptModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setAcceptModalOpen(false);
            setSelectedApplication(null);
          }
        }}
        onConfirm={handleAcceptConfirm}
        isProcessing={isProcessing}
      />
      <EditRequestModal
        isOpen={isEditRequestModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setEditRequestModalOpen(false);
            setSelectedApplication(null);
          }
        }}
        onConfirm={handleEditRequestConfirm}
        isProcessing={isProcessing}
      />
      <NotPassedModal
        isOpen={isNotPassedModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setNotPassedModalOpen(false);
            setSelectedApplication(null);
          }
        }}
        onConfirm={handleNotPassedConfirm}
        isProcessing={isProcessing}
      />
    </Card>
  );
};

export default RegistrationRequestsTable;
