import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import CustomSelect from '@/shared/components/CustomSelect';
import Input from '@/shared/components/Input';
import FormField from '@/shared/components/FormField';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
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
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      reset();
    }, 200);
  }, [onClose, reset, isLoading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClose]);

  const handleFormSubmit = async (data: ScheduleInterviewFormData) => {
    await onSubmit(data);
  };

  const interviewTypeOptions = INTERVIEW_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: currentLang === 'ar' ? option.labelAr : option.labelEn,
  }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-2xl bg-white p-6 py-7 shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute start-3 top-3 text-xl text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="mb-6 text-center text-lg font-semibold text-gray-800">
          {t('jobAnnouncement.applicantsPage.scheduleInterview')}
        </h2>

        {applicantName && (
          <p className="mb-4 text-center text-sm text-gray-500">
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
      </div>
    </div>
  );
}
