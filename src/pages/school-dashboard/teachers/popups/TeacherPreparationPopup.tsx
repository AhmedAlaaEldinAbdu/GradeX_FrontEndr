import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';

export interface TeacherPreparationFormValues {
  date: string;
  checkInTime: string;
  checkOutTime: string;
}

interface TeacherPreparationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: TeacherPreparationFormValues) => void | Promise<void>;
  teacherId: string;
}

const createFormDefaults = (): TeacherPreparationFormValues => ({
  date: '',
  checkInTime: '',
  checkOutTime: '',
});

export default function TeacherPreparationPopup({
  isOpen,
  onClose,
  onSubmit,
  teacherId,
}: TeacherPreparationPopupProps) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeacherPreparationFormValues>({
    defaultValues: createFormDefaults(),
  });

  useEffect(() => {
    if (isOpen) {
      reset(createFormDefaults());
    }
  }, [isOpen, reset]);

  const closeAndReset = () => {
    reset(createFormDefaults());
    onClose();
  };

  const handleFormSubmit = async (values: TeacherPreparationFormValues) => {
    console.log('Teacher Preparation Data:', { ...values, teacherId });
    if (onSubmit) {
      await onSubmit(values);
    }
    closeAndReset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={t('teachers.details.teacherPreparation')}
      size="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-5">
          {/* Date Field */}
          <FormField
            label={t('teachers.details.date')}
            required
            error={errors.date?.message}
            htmlFor="date"
          >
            <Controller
              name="date"
              control={control}
              rules={{ required: t('common.validation.required') }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="date"
                  type="date"
                  icon={<CustomImage src={CalendarIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('teachers.details.selectDate')}
                  className="flex justify-end"
                />
              )}
            />
          </FormField>

          {/* Check-In Time Field */}
          <FormField
            label={t('teachers.details.checkInTime')}
            required
            error={errors.checkInTime?.message}
            htmlFor="checkInTime"
          >
            <Controller
              name="checkInTime"
              control={control}
              rules={{ required: t('common.validation.required') }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="checkInTime"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('teachers.details.selectCheckInTime')}
                  className="flex justify-end"
                />
              )}
            />
          </FormField>

          {/* Check-Out Time Field */}
          <FormField
            label={t('teachers.details.checkOutTime')}
            required
            error={errors.checkOutTime?.message}
            htmlFor="checkOutTime"
          >
            <Controller
              name="checkOutTime"
              control={control}
              rules={{ required: t('common.validation.required') }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="checkOutTime"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('teachers.details.selectCheckOutTime')}
                  className="flex justify-end"
                />
              )}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={closeAndReset} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.confirm')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
