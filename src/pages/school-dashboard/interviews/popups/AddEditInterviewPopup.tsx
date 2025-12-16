import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';

export interface SelectOption {
  value: string;
  label: string;
}

export interface AddInterviewFormValues {
  interviewNameAr: string;
  interviewNameEn: string;
  announcementId: string;
  teacherId: string;
  supervisorId: string;
  startTime: string;
  endTime: string;
}

interface AddEditInterviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (values: AddInterviewFormValues) => void | Promise<void>;
  announcements: SelectOption[];
  teachers: SelectOption[];
  supervisors: SelectOption[];
  selectedDate?: Date | null;
  mode?: 'add' | 'edit';
  initialValues?: AddInterviewFormValues | null;
}

export const createInterviewFormDefaults = (): AddInterviewFormValues => ({
  interviewNameAr: '',
  interviewNameEn: '',
  announcementId: '',
  teacherId: '',
  supervisorId: '',
  startTime: '',
  endTime: '',
});

export default function AddEditInterviewPopup({
  isOpen,
  onClose,
  onSubmit,
  announcements,
  teachers,
  supervisors,
  selectedDate,
  mode = 'add',
  initialValues,
}: AddEditInterviewPopupProps) {
  const { t, i18n } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddInterviewFormValues>({
    defaultValues: createInterviewFormDefaults(),
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues ?? createInterviewFormDefaults());
    }
  }, [isOpen, initialValues, reset]);

  const formattedSelectedDate = selectedDate
    ? format(selectedDate, 'PPP', { locale: i18n.language === 'ar' ? ar : undefined })
    : null;

  const closeAndReset = () => {
    reset(createInterviewFormDefaults());
    onClose();
  };

  const handleFormSubmit = async (values: AddInterviewFormValues) => {
    if (onSubmit) {
      await onSubmit(values);
    }
    closeAndReset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndReset}
      title={mode === 'edit' ? t('interviews.editInterview') : t('interviews.addInterview')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {formattedSelectedDate && (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
            <span className="font-medium text-gray-900">{t('interviews.interviewDate')}:</span>{' '}
            {formattedSelectedDate}
          </div>
        )}

        <div>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label={t('interviews.interviewNameAr')}
                required
                error={errors.interviewNameAr?.message}
                htmlFor="interviewNameAr"
              >
                <Input
                  id="interviewNameAr"
                  placeholder={t('interviews.enterInterviewNameAr')}
                  {...register('interviewNameAr', {
                    required: t('common.validation.required'),
                  })}
                />
              </FormField>

              <FormField
                label={t('interviews.interviewNameEn')}
                required
                error={errors.interviewNameEn?.message}
                htmlFor="interviewNameEn"
              >
                <Input
                  id="interviewNameEn"
                  placeholder={t('interviews.enterInterviewNameEn')}
                  {...register('interviewNameEn', {
                    required: t('common.validation.required'),
                  })}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label={t('interviews.teacherName')}
                required
                error={errors.teacherId?.message}
                htmlFor="teacherId"
              >
                <Controller
                  name="teacherId"
                  control={control}
                  rules={{ required: t('common.validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      id="teacherId"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={teachers}
                      placeholder={t('interviews.selectTeacherName')}
                      error={!!errors.teacherId}
                      disabled={teachers.length === 0}
                    />
                  )}
                />
              </FormField>

              <FormField
                label={t('interviews.supervisor')}
                required
                error={errors.supervisorId?.message}
                htmlFor="supervisorId"
              >
                <Controller
                  name="supervisorId"
                  control={control}
                  rules={{ required: t('common.validation.required') }}
                  render={({ field }) => (
                    <CustomSelect
                      id="supervisorId"
                      value={field.value ?? ''}
                      onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                      options={supervisors}
                      placeholder={t('interviews.selectSupervisor')}
                      error={!!errors.supervisorId}
                      disabled={supervisors.length === 0}
                    />
                  )}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label={t('interviews.startTime')}
                required
                error={errors.startTime?.message}
                htmlFor="startTime"
              >
                <Input
                  id="startTime"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('interviews.selectStartTime')}
                  {...register('startTime', {
                    required: t('common.validation.required'),
                  })}
                  className="flex justify-end"
                />
              </FormField>

              <FormField
                label={t('interviews.endTime')}
                required
                error={errors.endTime?.message}
                htmlFor="endTime"
              >
                <Input
                  id="endTime"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('interviews.selectEndTime')}
                  {...register('endTime', {
                    required: t('common.validation.required'),
                  })}
                  className="flex justify-end"
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={closeAndReset} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('common.saving')
              : mode === 'edit'
                ? t('common.save')
                : t('common.add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
