import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/shared/context/ToastContext';
import PageHeader from '@/shared/components/PageHeader';
import EmployeesAttendanceTab from './components/EmployeesAttendanceTab';
import AddAttendanceSchedulePopup, {
  type AttendanceScheduleFormData,
} from './popups/AddAttendanceSchedulePopup';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { updateWorkingHours } from '@/services/api/schools/schools.service';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function EmployeesAttendancePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const schoolBranchId = getCurrentSchoolBranchId();
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <PageHeader
        title="attendance.employeesTitle"
        actions={[
          {
            label: 'attendance.addAttendanceSchedule',
            onClick: () => setIsSchedulePopupOpen(true),
            imgSrc: PlusIcon,
            imgClassName: 'w-[20px] h-[20px]',
          },
        ]}
      />

      <EmployeesAttendanceTab isActive={true} />

      <AddAttendanceSchedulePopup
        open={isSchedulePopupOpen}
        onClose={() => setIsSchedulePopupOpen(false)}
        onSubmit={handleSubmitSchedule}
        isLoading={isSubmitting}
      />
    </div>
  );
}
