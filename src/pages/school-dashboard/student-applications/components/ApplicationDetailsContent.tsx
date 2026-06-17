import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import {
  fetchStudentApplicationById,
  updateStudentApplicationStatus,
} from '@/redux/features/student-applications/studentApplicationsSlice';
import Loading from '@/shared/components/Loading';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';
import { sendEditRequest } from '@/services/api/student-applications/student-applications.service';
import { createStudentInterview } from '@/services/api/student-interviews/student-interviews.service';
import { assignStudentToClassroom } from '@/services/api/students/students.service';
import { useToast } from '@/shared/context/ToastContext';
import StudentIcon from '@gradex/assets/icons/Student.svg';

// Import extracted components
import ApplicationHeaderActions from './ApplicationHeaderActions';
import ApplicationParentInfo from './ApplicationParentInfo';
import ApplicationChildInfo from './ApplicationChildInfo';
import ApplicationTuitionFees from './ApplicationTuitionFees';
import ApplicationAttachments from './ApplicationAttachments';
import ApplicationStatusBanner from './ApplicationStatusBanner';
import NotPassedModal from './NotPassedModal';
import AcceptModal from './AcceptModal';
import EditRequestModal from './EditRequestModal';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import HousingModal from './HousingModal';
import { useEffect } from 'react';

interface ApplicationDetailsContentProps {
  applicationId: string;
}

const ApplicationDetailsContent: React.FC<ApplicationDetailsContentProps> = ({ applicationId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  // Modal states
  const [isNotPassedModalOpen, setNotPassedModalOpen] = useState(false);
  const [isAcceptModalOpen, setAcceptModalOpen] = useState(false);
  const [isEditRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isHousingModalOpen, setHousingModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHousingLoading, setHousingLoading] = useState(false);

  const { currentApplication, currentApplicationLoading, error } = useAppSelector(
    (state) => state.studentApplications
  );

  useEffect(() => {
    if (applicationId) {
      dispatch(fetchStudentApplicationById(applicationId));
    }
  }, [dispatch, applicationId]);

  if (currentApplicationLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !currentApplication) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-red-600">{error || t('common.error')}</div>
      </div>
    );
  }

  const data = currentApplication;
  const studentFullName = `${data.firstName} ${data.secondName} ${data.thirdName} ${data.fourthName}`;
  const effectiveStatus = data.status;
  const effectiveInterviewDate = data.interviewDate;

  // Action handlers — open modals
  const handleAccept = () => {
    setAcceptModalOpen(true);
  };

  const handleNotPassed = () => {
    setNotPassedModalOpen(true);
  };

  const handleEditRequest = () => {
    setEditRequestModalOpen(true);
  };

  const handleScheduleAppointment = () => {
    setScheduleModalOpen(true);
  };

  const handleHousing = () => {
    setHousingModalOpen(true);
  };

  // Modal confirm handlers
  const handleNotPassedConfirm = async (_reason: string) => {
    try {
      setIsProcessing(true);
      await dispatch(
        updateStudentApplicationStatus({
          id: applicationId,
          status: StudentApplicationStatus.Reject,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setNotPassedModalOpen(false);
      dispatch(fetchStudentApplicationById(applicationId));
    } catch (error) {
      console.error('Failed to update application status:', error);
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

  const handleAcceptConfirm = async (_contractFile?: File) => {
    try {
      setIsProcessing(true);
      await dispatch(
        updateStudentApplicationStatus({
          id: applicationId,
          status: StudentApplicationStatus.Accept,
        })
      ).unwrap();

      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setAcceptModalOpen(false);
      dispatch(fetchStudentApplicationById(applicationId));
    } catch (error) {
      console.error('Failed to update application status:', error);
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

  const handleEditRequestConfirm = async (message: string) => {
    try {
      setIsProcessing(true);
      await sendEditRequest(applicationId, message);
      showToast({
        message: t('studentApplications.statusUpdated'),
        type: 'success',
      });
      setEditRequestModalOpen(false);
      dispatch(fetchStudentApplicationById(applicationId));
    } catch (error) {
      console.error('Failed to send edit request:', error);
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

  const handleScheduleConfirm = async (date: string, time: string) => {
    try {
      if (!schoolBranchId) {
        showToast({
          message: t('common.error'),
          type: 'error',
        });
        return;
      }

      setIsProcessing(true);

      const interviewDate = new Date(`${date}T${time}:00`).toISOString();
      const startDate = new Date(`${date}T${time}:00`);
      const startTime = startDate.toISOString();
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endTime = endDate.toISOString();

      await createStudentInterview({
        schoolBranchesId: schoolBranchId,
        studentId: data.studentId,
        interviewDate,
        startTime,
        endTime,
      });

      showToast({
        message: t('studentApplications.appointmentScheduled'),
        type: 'success',
      });
      setScheduleModalOpen(false);
      dispatch(fetchStudentApplicationById(applicationId));
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

  return (
    <>
      {/* Header with Student Name and Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{studentFullName}</h1>
        <ApplicationHeaderActions
          status={effectiveStatus}
          hasInterview={!!effectiveInterviewDate}
          isHoused={!!data.classroomid}
          onAccept={handleAccept}
          onNotPassed={handleNotPassed}
          onEditRequest={handleEditRequest}
          onSchedule={handleScheduleAppointment}
          onHousing={handleHousing}
        />
      </div>

      {/* Single white card container for all sections */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Profile Image - centered at top */}
        <div className="mb-6 flex flex-col items-center justify-center">
          <CustomImage
            src={data.studentPhotoPath ? `${baseUrl}/${data.studentPhotoPath}` : ''}
            fallbackSrc={StudentIcon}
            alt={t('studentApplications.details.studentPhoto')}
            className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover"
          />
        </div>

        {/* Application Status Section */}
        <ApplicationStatusBanner status={effectiveStatus} interviewDate={effectiveInterviewDate} />

        {/* Parent Information Section */}
        <ApplicationParentInfo
          parentInfo={data.parentInfo}
          nationalityName={data.nationalityName}
        />

        {/* Child Information Section */}
        <ApplicationChildInfo data={data} />

        {/* Tuition Fees Section */}
        <ApplicationTuitionFees data={data} />

        {/* Attachments Section */}
        <ApplicationAttachments data={data} baseUrl={baseUrl} />
      </div>

      {/* Action Modals */}
      <NotPassedModal
        isOpen={isNotPassedModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setNotPassedModalOpen(false);
          }
        }}
        onConfirm={handleNotPassedConfirm}
        isProcessing={isProcessing}
      />
      <AcceptModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          if (!isProcessing) {
            setAcceptModalOpen(false);
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
          }
        }}
        onConfirm={handleEditRequestConfirm}
        isProcessing={isProcessing}
      />
      <ScheduleAppointmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
      />
      <HousingModal
        isOpen={isHousingModalOpen}
        onClose={() => setHousingModalOpen(false)}
        isLoading={isHousingLoading}
        gradeId={data.gradeId}
        onConfirm={async (classroomId) => {
          try {
            setHousingLoading(true);
            await assignStudentToClassroom(data.studentId, classroomId);
            showToast({
              message: t('studentApplications.modals.housingSuccess'),
              type: 'success',
            });
            setHousingModalOpen(false);
            // Refresh application details to reflect the change
            dispatch(fetchStudentApplicationById(applicationId));
          } catch (error) {
            console.error('Failed to assign student to classroom:', error);
            const errorMessage = error instanceof Error ? error.message : t('common.error');
            showToast({
              message: errorMessage,
              type: 'error',
              isRaw: error instanceof Error && errorMessage !== t('common.error'),
            });
          } finally {
            setHousingLoading(false);
          }
        }}
      />
    </>
  );
};

export default ApplicationDetailsContent;
