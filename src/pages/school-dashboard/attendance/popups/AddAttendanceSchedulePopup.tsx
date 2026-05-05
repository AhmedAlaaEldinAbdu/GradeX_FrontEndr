import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/shared/components/Input';
import FormField from '@/shared/components/FormField';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';

interface AttendanceScheduleFormData {
  workingHoursFrom: string;
  workingHoursTo: string;
}

interface AddAttendanceSchedulePopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceScheduleFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AddAttendanceSchedulePopup({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: AddAttendanceSchedulePopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttendanceScheduleFormData>({
    defaultValues: {
      workingHoursFrom: '',
      workingHoursTo: '',
    },
  });

  const scrollToFirstError = useScrollToFirstError<AttendanceScheduleFormData>();

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

  const handleFormSubmit = async (data: AttendanceScheduleFormData) => {
    await onSubmit(data);
  };

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
          {t('attendance.addAttendanceSchedule')}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit, scrollToFirstError)} className="space-y-4">
          {/* Working Hours From (Check-In Time) */}
          <FormField
            label={t('attendance.checkInTimeLabel')}
            required
            error={errors.workingHoursFrom?.message}
            htmlFor="workingHoursFrom"
          >
            <Controller
              name="workingHoursFrom"
              control={control}
              rules={{ required: t('common.validation.required') }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="workingHoursFrom"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('attendance.selectCheckInTime')}
                  className="flex justify-end"
                />
              )}
            />
          </FormField>

          {/* Working Hours To (Check-Out Time) */}
          <FormField
            label={t('attendance.checkOutTimeLabel')}
            required
            error={errors.workingHoursTo?.message}
            htmlFor="workingHoursTo"
          >
            <Controller
              name="workingHoursTo"
              control={control}
              rules={{ required: t('common.validation.required') }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="workingHoursTo"
                  type="time"
                  icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
                  placeholder={t('attendance.selectCheckOutTime')}
                  className="flex justify-end"
                />
              )}
            />
          </FormField>

          {/* Action Buttons */}
          <div className="flex flex-row-reverse gap-3 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : t('common.confirm')}
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

export type { AttendanceScheduleFormData };
