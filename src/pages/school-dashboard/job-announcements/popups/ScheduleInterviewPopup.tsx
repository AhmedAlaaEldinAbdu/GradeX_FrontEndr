import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import FormField from '@/shared/components/FormField';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import Modal from '@/shared/popups/Modal';
import CalendarIcon from '@gradex/assets/icons/Calendar.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';

export interface ScheduleInterviewFormData {
  interviewType: string;
  interviewDate: string;
  interviewTime: string;
}

interface ScheduleInterviewPopupProps {
  open: boolean;
  applicantName?: string;
  onClose: () => void;
  onSubmit: (data: ScheduleInterviewFormData) => Promise<void>;
  isLoading?: boolean;
}

const INTERVIEW_TYPE_OPTIONS = [
  { value: 'online', labelAr: 'مقابلة اونلاين', labelEn: 'Online Interview' },
  { value: 'onsite', labelAr: 'مقابلة حضورية', labelEn: 'On-site Interview' },
  { value: 'phone', labelAr: 'مقابلة هاتفية', labelEn: 'Phone Interview' },
];

export default function ScheduleInterviewPopup({
  open,
  applicantName,
  onClose,
  onSubmit,
  isLoading = false,
}: ScheduleInterviewPopupProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'ar' | 'en';

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleInterviewFormData>({
    defaultValues: {
      interviewType: '',
      interviewDate: '',
      interviewTime: '',
    },
  });

  const handleClose = useCallback(() => {
    if (isLoading) return;
    onClose();
    reset();
  }, [onClose, reset, isLoading]);

  const handleFormSubmit = async (data: ScheduleInterviewFormData) => {
    await onSubmit(data);
  };

  const interviewTypeOptions = INTERVIEW_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: currentLang === 'ar' ? option.labelAr : option.labelEn,
  }));

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={t('jobAnnouncement.applicantsPage.scheduleInterview')}
      size="sm"
      closeOnOverlayClick={!isLoading}
      contentClassName="space-y-4"
    >
      {applicantName && (
        <p className="text-center text-sm text-gray-500">
          {t('jobAnnouncement.applicantsPage.schedulingFor', { name: applicantName })}
        </p>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Interview Type */}
        <FormField
          label={t('jobAnnouncement.applicantsPage.interviewType')}
          required
          error={errors.interviewType?.message}
          htmlFor="interviewType"
        >
          <Controller
            name="interviewType"
            control={control}
            rules={{ required: t('common.validation.required') }}
            render={({ field }) => (
              <CustomSelect
                value={field.value}
                onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                options={interviewTypeOptions}
                placeholder={t('jobAnnouncement.applicantsPage.selectInterviewType')}
              />
            )}
          />
        </FormField>

        {/* Interview Date */}
        <FormField
          label={t('jobAnnouncement.applicantsPage.interviewDate')}
          required
          error={errors.interviewDate?.message}
          htmlFor="interviewDate"
        >
          <Controller
            name="interviewDate"
            control={control}
            rules={{ required: t('common.validation.required') }}
            render={({ field }) => (
              <Input
                {...field}
                id="interviewDate"
                type="date"
                icon={<CustomImage src={CalendarIcon} className="h-5 w-5 text-gray-400" />}
                placeholder={t('jobAnnouncement.applicantsPage.selectInterviewDate')}
                className="flex justify-end"
              />
            )}
          />
        </FormField>

        {/* Interview Time */}
        <FormField
          label={t('jobAnnouncement.applicantsPage.interviewTime')}
          required
          error={errors.interviewTime?.message}
          htmlFor="interviewTime"
        >
          <Controller
            name="interviewTime"
            control={control}
            rules={{ required: t('common.validation.required') }}
            render={({ field }) => (
              <Input
                {...field}
                id="interviewTime"
                type="time"
                icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                placeholder={t('jobAnnouncement.applicantsPage.selectInterviewTime')}
                className="flex justify-end"
              />
            )}
          />
        </FormField>

        {/* Action Buttons */}
        <div className="flex flex-row-reverse gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.processing') : t('jobAnnouncement.applicantsPage.schedule')}
          </Button>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
