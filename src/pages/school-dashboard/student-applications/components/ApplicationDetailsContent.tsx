import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentApplicationById } from '@/redux/features/student-applications/studentApplicationsSlice';
import Loading from '@/shared/components/Loading';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';

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

// Mock status options for testing
const MOCK_STATUS_OPTIONS = [
  { value: '', label: '--- Use Real Status ---' },
  { value: String(StudentApplicationStatus.Modified), label: 'Modified (تم التعديل)' },
  { value: String(StudentApplicationStatus.EditRequested), label: 'Edit Requested (طلب تعديل)' },
  { value: String(StudentApplicationStatus.NotPassed), label: 'Not Passed (لم يجتاز)' },
  {
    value: String(StudentApplicationStatus.WaitingForSignature),
    label: 'Waiting for Interview (في إنتظار التوقيع)',
  },
  { value: String(StudentApplicationStatus.Completed), label: 'Completed (إكتمل)' },
];

const ApplicationDetailsContent: React.FC<ApplicationDetailsContentProps> = ({ applicationId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  // Mock status override for testing (set to '' to use real data)
  const [mockStatus, setMockStatus] = useState<string>('');
  const [mockInterviewDate, setMockInterviewDate] = useState<boolean>(false);

  // Modal states
  const [isNotPassedModalOpen, setNotPassedModalOpen] = useState(false);
  const [isAcceptModalOpen, setAcceptModalOpen] = useState(false);
  const [isEditRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isHousingModalOpen, setHousingModalOpen] = useState(false);

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

  // Determine the effective status (mock or real)
  const effectiveStatus = mockStatus
    ? (Number(mockStatus) as StudentApplicationStatus)
    : data.status;
  const effectiveInterviewDate = mockInterviewDate ? '2025-02-11T10:00:00' : data.interviewDate;

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
  const handleNotPassedConfirm = (reason: string) => {
    console.log('Not passed confirmed with reason:', reason, applicationId);
    setNotPassedModalOpen(false);
    // TODO: Call API to mark as not passed
  };

  const handleAcceptConfirm = (contractFile?: File) => {
    console.log('Accept confirmed with contract:', contractFile, applicationId);
    setAcceptModalOpen(false);
    // TODO: Call API to accept application
  };

  const handleEditRequestConfirm = (message: string) => {
    console.log('Edit request sent:', message, applicationId);
    setEditRequestModalOpen(false);
    // TODO: Call API to send edit request
  };

  const handleScheduleConfirm = (date: string, time: string) => {
    console.log('Appointment scheduled:', date, time, applicationId);
    setScheduleModalOpen(false);
    // TODO: Call API to schedule appointment
  };

  return (
    <>
      {/* DEBUG: Mock Status Selector — only visible in dev */}
      {import.meta.env.DEV && (
        <div className="mb-4 rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 p-3">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">
            🛠 Debug: Mock Status Override
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={mockStatus}
              onChange={(e) => setMockStatus(e.target.value)}
            >
              {MOCK_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-sm text-amber-800">
              <input
                type="checkbox"
                checked={mockInterviewDate}
                onChange={(e) => setMockInterviewDate(e.target.checked)}
                className="rounded"
              />
              Mock Interview Date
            </label>
          </div>
        </div>
      )}

      {/* Header with Student Name and Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{studentFullName}</h1>
        <ApplicationHeaderActions
          status={effectiveStatus}
          hasInterview={!!effectiveInterviewDate}
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
            alt={studentFullName}
            className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover"
          />
        </div>

        {/* Application Status Section */}
        <ApplicationStatusBanner status={effectiveStatus} interviewDate={effectiveInterviewDate} />

        {/* Parent Information Section */}
        <ApplicationParentInfo parentInfo={data.parentInfo} />

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
        onClose={() => setNotPassedModalOpen(false)}
        onConfirm={handleNotPassedConfirm}
      />
      <AcceptModal
        isOpen={isAcceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        onConfirm={handleAcceptConfirm}
      />
      <EditRequestModal
        isOpen={isEditRequestModalOpen}
        onClose={() => setEditRequestModalOpen(false)}
        onConfirm={handleEditRequestConfirm}
      />
      <ScheduleAppointmentModal
        isOpen={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
      />
      <HousingModal
        isOpen={isHousingModalOpen}
        onClose={() => setHousingModalOpen(false)}
        onConfirm={(classroomId) => {
          console.log('Housing confirmed, classroom:', classroomId, applicationId);
          setHousingModalOpen(false);
          // TODO: Call API to assign student to classroom
        }}
      />
    </>
  );
};

export default ApplicationDetailsContent;
