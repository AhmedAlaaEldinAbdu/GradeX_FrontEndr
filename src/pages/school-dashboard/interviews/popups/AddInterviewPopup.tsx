import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import FormField from '@/shared/components/FormField';
import Select from '@/shared/components/Select';
import Input from '@/shared/components/Input';
import Button from '@/shared/components/Button';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import CustomImage from '@/shared/components/CustomImage';

export interface SelectOption {
  value: string;
  label: string;
}

export interface AddInterviewFormValues {
  announcementId: string;
  teacherId: string;
  supervisorId: string;
  startTime: string;
  endTime: string;
}

interface AddInterviewPopupProps {
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
  announcementId: '',
  teacherId: '',
  supervisorId: '',
  startTime: '',
  endTime: '',
});

export default function AddInterviewPopup({
  isOpen,
  onClose,
  onSubmit,
  announcements,
  teachers,
  supervisors,
  selectedDate,
  mode = 'add',
  initialValues,
}: AddInterviewPopupProps) {
  const { t, i18n } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
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

  const withPlaceholder = (placeholder: string, options: SelectOption[]) => [
    { value: '', label: placeholder },
    ...options,
  ];

  const announcementOptions = useMemo(
    () => withPlaceholder(t('interviews.selectAnnouncementName'), announcements),
    [announcements, t]
  );

  const teacherOptions = useMemo(
    () => withPlaceholder(t('interviews.selectTeacherName'), teachers),
    [teachers, t]
  );

  const supervisorOptions = useMemo(
    () => withPlaceholder(t('interviews.selectSupervisor'), supervisors),
    [supervisors, t]
  );

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
      size="lg"
      contentClassName="bg-gray-50"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {formattedSelectedDate && (
          <div className="rounded-lg bg-white p-4 text-center text-sm text-gray-600 shadow-sm">
            <span className="font-medium text-gray-900">{t('interviews.interviewDate')}:</span>{' '}
            {formattedSelectedDate}
          </div>
        )}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="space-y-5">
            <FormField
              label={t('interviews.announcementName')}
              required
              error={errors.announcementId?.message}
              htmlFor="announcementId"
            >
              <Select
                id="announcementId"
                {...register('announcementId', {
                  required: t('common.validation.required'),
                })}
                options={announcementOptions}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label={t('interviews.teacherName')}
                required
                error={errors.teacherId?.message}
                htmlFor="teacherId"
              >
                <Select
                  id="teacherId"
                  {...register('teacherId', {
                    required: t('common.validation.required'),
                  })}
                  options={teacherOptions}
                />
              </FormField>

              <FormField
                label={t('interviews.supervisor')}
                required
                error={errors.supervisorId?.message}
                htmlFor="supervisorId"
              >
                <Select
                  id="supervisorId"
                  {...register('supervisorId', {
                    required: t('common.validation.required'),
                  })}
                  options={supervisorOptions}
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
