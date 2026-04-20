import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import PageHeader from '@/shared/components/PageHeader';
import Attendance from './components/Attendance';
import AddAttendanceSchedulePopup, {
  type AttendanceScheduleFormData,
} from './popups/AddAttendanceSchedulePopup';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { updateWorkingHours } from '@/services/api/schools/schools.service';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function AttendancePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'students');
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleOpenSchedulePopup = () => {
    setIsSchedulePopupOpen(true);
  };

  const handleCloseSchedulePopup = () => {
    setIsSchedulePopupOpen(false);
  };

  const handleSubmitSchedule = async (data: AttendanceScheduleFormData) => {
    if (!schoolBranchId) {
      showToast({ message: t('common.errorOccurred'), type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateWorkingHours(schoolBranchId, {
        workingHoursFrom: data.workingHoursFrom,
        workingHoursTo: data.workingHoursTo,
      });
      showToast({ message: t('attendance.scheduleUpdatedSuccess'), type: 'success' });
      setIsSchedulePopupOpen(false);
    } catch (error) {
      console.error('Failed to update working hours:', error);
      showToast({ message: t('attendance.scheduleUpdatedError'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="attendance.title"
        actions={
          activeTab === 'employees'
            ? [
                {
                  label: 'attendance.addAttendanceSchedule',
                  onClick: handleOpenSchedulePopup,
                  imgSrc: PlusIcon,
                  imgClassName: 'w-[20px] h-[20px]',
                },
              ]
            : undefined
        }
      />

      {/* Main Content */}
      <Attendance onTabChange={setActiveTab} />

      {/* Add Attendance Schedule Popup */}
      <AddAttendanceSchedulePopup
        open={isSchedulePopupOpen}
        onClose={handleCloseSchedulePopup}
        onSubmit={handleSubmitSchedule}
        isLoading={isSubmitting}
      />
    </div>
  );
}
