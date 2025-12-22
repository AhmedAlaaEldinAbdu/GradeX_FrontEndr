import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/shared/context/ToastContext';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Attendance from './components/Attendance';
import AddAttendanceSchedulePopup, {
  type AttendanceScheduleFormData,
} from './popups/AddAttendanceSchedulePopup';
import { updateWorkingHours } from '@/services/api/schools/schools.service';
import { STATIC_SCHOOL_BRANCH_ID } from '@/redux/features/teacher-attendance/teacherAttendanceSlice';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function AttendancePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
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
    try {
      setIsSubmitting(true);
      await updateWorkingHours(STATIC_SCHOOL_BRANCH_ID, {
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

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('attendance.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

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
