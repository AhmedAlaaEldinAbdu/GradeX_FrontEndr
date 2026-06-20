import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { yupResolver } from '@hookform/resolvers/yup';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import {
  ScheduleAppointmentFormSchema,
  type ScheduleAppointmentFormProps,
} from '@/validations/student-applications-validations';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

interface ScheduleStudentAppointmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ScheduleAppointmentFormProps) => Promise<void>;
  studentName?: string;
  isLoading?: boolean;
}

const APPOINTMENT_FORM_DEFAULTS: ScheduleAppointmentFormProps = {
  appointmentDate: '',
  appointmentTime: '',
};

export default function ScheduleStudentAppointmentPopup({
  isOpen,
  onClose,
  onSubmit,
  // studentName,
  isLoading = false,
}: ScheduleStudentAppointmentPopupProps) {
  const { t } = useTranslation();

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleAppointmentFormProps>({
    resolver: yupResolver(ScheduleAppointmentFormSchema),
    defaultValues: APPOINTMENT_FORM_DEFAULTS,
  });

  const scrollToFirstError = useScrollToFirstError<ScheduleAppointmentFormProps>();

  useEffect(() => {
    if (isOpen) {
      reset(APPOINTMENT_FORM_DEFAULTS);
    }
  }, [isOpen, reset]);

  const closeAndReset = () => {
    reset(APPOINTMENT_FORM_DEFAULTS);
    onClose();
  };

  const handleFormSubmit = async (values: ScheduleAppointmentFormProps) => {
    await onSubmit(values);
    closeAndReset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={t('studentApplications.scheduleAppointment')}
      closeOnOverlayClick={!isLoading && !isSubmitting}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit, scrollToFirstError)} className="space-y-6">
        {/* {studentName && (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
            <span className="font-medium text-gray-900">{t('studentManagement.studentName')}:</span>{' '}
            {studentName}
          </div>
        )} */}

        <div className="space-y-5">
          {/* Appointment Date */}
          <FormField
            label={t('studentApplications.appointmentDate')}
            required
            error={errors.appointmentDate?.message && t(errors.appointmentDate.message)}
            htmlFor="appointmentDate"
          >
            <Controller
              name="appointmentDate"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="appointmentDate"
                  type="date"
                  icon={<CustomImage src={CalendarIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('studentApplications.selectDate')}
                  className="flex justify-end"
                  error={errors.appointmentDate ? ' ' : undefined}
                  disabled={isLoading || isSubmitting}
                />
              )}
            />
          </FormField>

          {/* Appointment Time */}
          <FormField
            label={t('studentApplications.appointmentTime')}
            required
            error={errors.appointmentTime?.message && t(errors.appointmentTime.message)}
            htmlFor="appointmentTime"
          >
            <Controller
              name="appointmentTime"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="appointmentTime"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('studentApplications.selectTime')}
                  className="flex justify-end"
                  error={errors.appointmentTime ? ' ' : undefined}
                  disabled={isLoading || isSubmitting}
                />
              )}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={closeAndReset}
            disabled={isLoading || isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={isLoading || isSubmitting}>
            {t('common.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
