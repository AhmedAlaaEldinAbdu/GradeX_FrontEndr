import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import Card from '@gradex/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import StudentIcon from '@gradex/assets/icons/Student.svg';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import CheckmarkCircleIcon from '@gradex/assets/icons/CheckmarkCircle.svg';
import EventCalendarIcon from '@gradex/assets/icons/EventCalendar.svg';
import XMarkDangerIcon from '@gradex/assets/icons/XMarkDanger.svg';
import Input from '@/shared/components/Input';
import { FaRegCalendarAlt } from 'react-icons/fa';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentInterviews } from '@/redux/features/student-interviews/studentInterviewsSlice';
import { updateStudentApplicationStatus } from '@/redux/features/student-applications/studentApplicationsSlice';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import type { StudentInterview } from '@/services/api/types/student-interviews.types';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';
import useLanguage from '@/hooks/useLanguage';
import { useToast } from '@/shared/context/ToastContext';
import { updateStudentInterview } from '@/services/api/student-interviews/student-interviews.service';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

import AcceptModal from './AcceptModal';
import NotPassedModal from './NotPassedModal';
import ChangeAppointmentModal from './ChangeAppointmentModal';

const PersonalInterviewsTable: React.FC = () => {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const schoolBranchId = getCurrentSchoolBranchId();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modal state
  const [isAcceptModalOpen, setAcceptModalOpen] = useState(false);
  const [isNotPassedModalOpen, setNotPassedModalOpen] = useState(false);
  const [isChangeAppointmentModalOpen, setChangeAppointmentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<StudentInterview | null>(null);

  // Redux State
  const { studentInterviews, pagination, isLoading } = useAppSelector(
    (state) => state.studentInterviews
  );
  const educationalStages = useAppSelector((state) => state.educationalStages.educationalStages);

  // Fetch educational stages for grade filter
  useEffect(() => {
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: 100,
        schoolBranchId: schoolBranchId || undefined,
      })
    );
  }, [dispatch]);

  // Fetch interviews when filters or pagination change
  useEffect(() => {
    dispatch(
      fetchStudentInterviews({
        page: pagination.pageIndex,
        limit: 10,
        filters: {
          studentName: searchTerm || undefined,
          gradeId: selectedGradeId || undefined,
          date: selectedDate || undefined,
          schoolBranchId: schoolBranchId || undefined,
        },
      })
    );
  }, [
    dispatch,
    pagination.pageIndex,
    pagination.pageSize,
    schoolBranchId,
    searchTerm,
    selectedGradeId,
    selectedDate,
  ]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Action handlers
  const handleAccept = (row: StudentInterview) => {
    setSelectedInterview(row);
    setAcceptModalOpen(true);
  };

  const handleNotPassed = (row: StudentInterview) => {
    setSelectedInterview(row);
    setNotPassedModalOpen(true);
  };

  const handleChangeAppointment = (row: StudentInterview) => {
    setSelectedInterview(row);
    setChangeAppointmentModalOpen(true);
  };

  // Modal confirm handlers
  const handleAcceptConfirm = async () => {
    if (!selectedInterview) return;
    const targetId = selectedInterview.studentId;
    if (!targetId) return;

    try {
      setIsProcessing(true);
      await dispatch(
        updateStudentApplicationStatus({
          id: targetId,
          status: StudentApplicationStatus.Accept,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setAcceptModalOpen(false);
      setSelectedInterview(null);

      dispatch(
        fetchStudentInterviews({
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          filters: {
            studentName: searchTerm || undefined,
            gradeId: selectedGradeId || undefined,
            date: selectedDate || undefined,
            schoolBranchId: schoolBranchId || undefined,
          },
        })
      );
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : t('common.error');
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: errorMessage !== t('common.error'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotPassedConfirm = async () => {
    if (!selectedInterview) return;
    const targetId = selectedInterview.studentId;
    if (!targetId) return;

    try {
      setIsProcessing(true);
      await dispatch(
        updateStudentApplicationStatus({
          id: targetId,
          status: StudentApplicationStatus.Reject,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setNotPassedModalOpen(false);
      setSelectedInterview(null);

      dispatch(
        fetchStudentInterviews({
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          filters: {
            studentName: searchTerm || undefined,
            gradeId: selectedGradeId || undefined,
            date: selectedDate || undefined,
            schoolBranchId: schoolBranchId || undefined,
          },
        })
      );
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : t('common.error');
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: errorMessage !== t('common.error'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeAppointmentConfirm = async (newDate: string, newTime: string) => {
    if (!selectedInterview) return;

    try {
      setIsProcessing(true);

      const interviewDate = new Date(`${newDate}T${newTime}:00`).toISOString();
      const startDate = new Date(`${newDate}T${newTime}:00`);
      const startTime = startDate.toISOString();
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endTime = endDate.toISOString();
      const targetSchoolBranchId = selectedInterview.schoolBranchesId || schoolBranchId;

      if (!targetSchoolBranchId) {
        throw new Error(t('common.error'));
      }

      await updateStudentInterview(selectedInterview.id, {
        schoolBranchesId: targetSchoolBranchId,
        studentId: selectedInterview.studentId,
        interviewDate,
        startTime,
        endTime,
      });

      showToast({
        message: t('studentApplications.appointmentChanged'),
        type: 'success',
      });
      setChangeAppointmentModalOpen(false);
      setSelectedInterview(null);

      dispatch(
        fetchStudentInterviews({
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          filters: {
            studentName: searchTerm || undefined,
            gradeId: selectedGradeId || undefined,
            date: selectedDate || undefined,
            schoolBranchId: schoolBranchId || undefined,
          },
        })
      );
    } catch (error) {
      console.error('Failed to change appointment:', error);
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

  const gradeOptions = educationalStages.map((stage) => ({
    value: stage.id,
    label: isArabic ? stage.nameAr : stage.nameEn,
  }));

  const columns: DataTableColumn<StudentInterview>[] = [
    {
      header: '#',
      accessor: (_row, index) => (
        <span className="font-medium text-gray-500">
          {(pagination.pageIndex - 1) * pagination.pageSize + (index || 0) + 1}
        </span>
      ),
      headerClassName: 'w-[50px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentManagement.studentName',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <CustomImage
            src=""
            alt={row.studentName || ''}
            fallbackSrc={StudentIcon}
            className="h-10 w-10 rounded-full border border-gray-100 object-cover"
          />
          <span
            className="w-[200px] truncate text-start font-medium text-gray-900"
            title={row.studentName || (isArabic ? row.nameAr : row.nameEn)}
          >
            {row.studentName || (isArabic ? row.nameAr : row.nameEn)}
          </span>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'studentApplications.interviewName',
      accessor: (row) => <span>{isArabic ? row.nameAr : row.nameEn}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.supervisor',
      accessor: (row) => <span>{row.supervisor || row.supervisorName || '-'}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.interviewDate',
      accessor: (row) => <span>{formatDate(row.interviewDate)}</span>,
      headerClassName: 'min-w-[150px] text-center',
      className: 'text-center',
    },
    {
      header: 'studentApplications.interviewTime',
      accessor: (row) => (
        <span>
          {formatTime(row.startTime)} - {formatTime(row.endTime)}
        </span>
      ),
      headerClassName: 'min-w-[180px] text-center',
      className: 'text-center',
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
            id: 'changeDate',
            label: t('studentApplications.actions.changeAppointment'),
            icon: EventCalendarIcon,
            onClick: () => handleChangeAppointment(row),
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
      name: 'grade-filter',
      value: selectedGradeId,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedGradeId}
          onChange={(value) => setSelectedGradeId(Array.isArray(value) ? (value[0] ?? '') : value)}
          options={gradeOptions}
          placeholder={t('studentApplications.educationalStage')}
        />
      ),
    },
    {
      type: 'custom',
      name: 'date-filter',
      value: selectedDate,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <Input
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder={t('studentApplications.interviewDate')}
          icon={<FaRegCalendarAlt className="h-4 w-4" />}
        />
      ),
    },
  ];

  return (
    <Card className="mt-8">
      <DataTable
        data={studentInterviews}
        columns={columns}
        keyExtractor={(row) => row.id}
        filters={filterConfigs}
        showFilters={true}
        isLoading={isLoading}
        pagination={{
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          total: pagination.totalItems,
          totalPages: pagination.totalPages,
        }}
        onPageChange={(newPage) => {
          dispatch(
            fetchStudentInterviews({
              page: newPage,
              limit: pagination.pageSize,
              filters: {
                studentName: searchTerm || undefined,
                gradeId: selectedGradeId || undefined,
                date: selectedDate || undefined,
                schoolBranchId: schoolBranchId || undefined,
              },
            })
          );
        }}
        onResetFilters={() => {
          setSearchTerm('');
          setSelectedGradeId('');
          setSelectedDate('');
          dispatch(
            fetchStudentInterviews({
              page: 1,
              limit: pagination.pageSize,
              filters: {
                schoolBranchId: schoolBranchId || undefined,
              },
            })
          );
        }}
        t={t}
      />

      {/* Action Modals */}
      <AcceptModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setAcceptModalOpen(false);
            setSelectedInterview(null);
          }
        }}
        onConfirm={handleAcceptConfirm}
        isProcessing={isProcessing}
      />
      <NotPassedModal
        isOpen={isNotPassedModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setNotPassedModalOpen(false);
            setSelectedInterview(null);
          }
        }}
        onConfirm={handleNotPassedConfirm}
        isProcessing={isProcessing}
      />
      <ChangeAppointmentModal
        isOpen={isChangeAppointmentModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setChangeAppointmentModalOpen(false);
            setSelectedInterview(null);
          }
        }}
        onConfirm={handleChangeAppointmentConfirm}
        originalDate={selectedInterview?.interviewDate}
        isProcessing={isProcessing}
      />
    </Card>
  );
};

export default PersonalInterviewsTable;
