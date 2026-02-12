import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchStudentApplicationById } from '@/redux/features/student-applications/studentApplicationsSlice';
import Loading from '@/shared/components/Loading';

// Import extracted components
import ApplicationHeaderActions from './ApplicationHeaderActions';
import ApplicationParentInfo from './ApplicationParentInfo';
import ApplicationChildInfo from './ApplicationChildInfo';
import ApplicationTuitionFees from './ApplicationTuitionFees';
import ApplicationAttachments from './ApplicationAttachments';

interface ApplicationDetailsContentProps {
  applicationId: string;
}

const ApplicationDetailsContent: React.FC<ApplicationDetailsContentProps> = ({ applicationId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

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

  const handleAccept = () => {
    console.log('Accept application', applicationId);
  };

  const handleNotPassed = () => {
    console.log('Not passed', applicationId);
  };

  const handleEditRequest = () => {
    console.log('Send edit request', applicationId);
  };

  const handleScheduleAppointment = () => {
    console.log('Schedule appointment', applicationId);
  };

  return (
    <>
      {/* Header with Student Name and Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{studentFullName}</h1>
        <ApplicationHeaderActions
          onAccept={handleAccept}
          onNotPassed={handleNotPassed}
          onEditRequest={handleEditRequest}
          onSchedule={handleScheduleAppointment}
        />
      </div>

      {/* Single white card container for all sections */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Profile Image - centered at top */}
        <div className="mb-6 flex justify-center">
          <CustomImage
            src={data.studentPhotoPath ? `${baseUrl}/${data.studentPhotoPath}` : ''}
            alt={studentFullName}
            className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover"
          />
        </div>

        {/* Parent Information Section */}
        <ApplicationParentInfo parentInfo={data.parentInfo} />

        {/* Child Information Section */}
        <ApplicationChildInfo data={data} />

        {/* Tuition Fees Section */}
        <ApplicationTuitionFees data={data} />

        {/* Attachments Section */}
        <ApplicationAttachments data={data} baseUrl={baseUrl} />
      </div>
    </>
  );
};

export default ApplicationDetailsContent;
