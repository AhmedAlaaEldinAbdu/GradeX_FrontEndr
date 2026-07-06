import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import FormField from '@/shared/components/FormField';
import CustomSelect from '@/shared/components/CustomSelect';
import CustomImage from '@/shared/components/CustomImage';
import { FaRegCalendarAlt } from 'react-icons/fa';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import { useAppDispatch } from '@/hooks/useRedux';
import { createInterview } from '@/redux/features/interviews/interviewsSlice';
import { useToast } from '@/shared/context/ToastContext';

import { InterviewType } from '@/services/api/types/interviews.types';

export interface ScheduleInterviewValues {
  interviewType: string;
  date: string;
  time: string;
}

interface ScheduleInterviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (values: ScheduleInterviewValues) => void | Promise<void>;
  schoolBranchesId?: string;
  jobAdvertisementId?: string;
  teacherId?: string;
  supervisorId?: string;
  isProcessing?: boolean;
}

const ScheduleInterviewPopup: React.FC<ScheduleInterviewPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  schoolBranchesId,
  jobAdvertisementId,
  teacherId,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [interviewType, setInterviewType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ interviewType?: string; date?: string; time?: string }>(
    {}
  );

  const resetState = () => {
    setInterviewType('');
    setDate('');
    setTime('');
    setErrors({});
  };

  const handleClose = () => {
    if (isProcessing || isSubmitting) return;
    resetState();
    onClose();
  };

  const handleConfirm = async () => {
    debugger;

    if (isProcessing || isSubmitting) return;

    const nextErrors: typeof errors = {};
    if (!interviewType) nextErrors.interviewType = t('common.validation.required');
    if (!date.trim()) nextErrors.date = t('common.validation.required');
    if (!time.trim()) nextErrors.time = t('common.validation.required');

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!schoolBranchesId || !jobAdvertisementId || !teacherId) {
      showToast({ message: t('common.error'), type: 'error' });
      return;
    }

    const normalizedTime = time.length === 5 ? `${time}:00` : time;
    const startDateTime = new Date(`${date}T${normalizedTime}`);

    if (Number.isNaN(startDateTime.getTime())) {
      showToast({ message: t('common.error'), type: 'error' });
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    try {
      setIsSubmitting(true);
      const res = await dispatch(
        createInterview({
          schoolBranchesId,
          jobAdvertisementId,
          teacherId,
          interviewDate: date,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          interViewType: Number(interviewType) as InterviewType,
        })
      )
        .unwrap()
        .then((res: any) => {
          if (res?.isSuccess) {
            showToast({
              message: res?.message || t('adminRequests.jobApplication.schedulePopup.success'),
              type: 'success',
            });
          } else {
            const message = res?.message || t('common.error');
            showToast({ message, type: 'error' });
          }
        });
      await onConfirm({ interviewType, date, time });
      resetState();
      onClose();
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');
      showToast({ message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('adminRequests.jobApplication.schedulePopup.title')}
      size="sm"
    >
      <div className="flex flex-col gap-5">
        <FormField
          label={t('adminRequests.jobApplication.schedulePopup.interviewType')}
          required
          error={errors.interviewType}
        >
          <CustomSelect
            value={interviewType}
            onChange={(value) => {
              setInterviewType(Array.isArray(value) ? (value[0] ?? '') : (value as string));
              if (errors.interviewType)
                setErrors((prev) => ({ ...prev, interviewType: undefined }));
            }}
            options={[
              {
                value: String(InterviewType.ONLINE),
                label: t('adminRequests.jobApplication.schedulePopup.online'),
              },
              {
                value: String(InterviewType.OFFLINE),
                label: t('adminRequests.jobApplication.schedulePopup.onsite'),
              },
            ]}
            placeholder={t('adminRequests.jobApplication.schedulePopup.interviewTypePlaceholder')}
            showSearch={false}
          />
        </FormField>

        <FormField
          label={t('adminRequests.jobApplication.schedulePopup.date')}
          required
          error={errors.date}
          htmlFor="interview-date"
        >
          <Input
            id="interview-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            placeholder={t('adminRequests.jobApplication.schedulePopup.datePlaceholder')}
            icon={<FaRegCalendarAlt />}
            error={errors.date ? ' ' : undefined}
            className="flex justify-end"
          />
        </FormField>

        <FormField
          label={t('adminRequests.jobApplication.schedulePopup.time')}
          required
          error={errors.time}
          htmlFor="interview-time"
        >
          <Input
            id="interview-time"
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              if (errors.time) setErrors((prev) => ({ ...prev, time: undefined }));
            }}
            placeholder={t('adminRequests.jobApplication.schedulePopup.timePlaceholder')}
            icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
            error={errors.time ? ' ' : undefined}
            className="flex justify-end"
          />
        </FormField>

        <div className="flex w-full gap-3 pt-2">
          <Button
            variant="outline"
            fullWidth
            onClick={handleClose}
            disabled={isProcessing || isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleConfirm}
            loading={isProcessing || isSubmitting}
          >
            {t('adminRequests.jobApplication.schedulePopup.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleInterviewPopup;
