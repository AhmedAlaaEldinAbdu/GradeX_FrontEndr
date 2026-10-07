import PopupFooter from '@/shared/popups/PopupFooter';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import CustomImage from '@/shared/components/CustomImage';
import { FaRegCalendarAlt } from 'react-icons/fa';
import ClockIcon from '@gradex/assets/icons/Clock.svg';
import useLanguage from '@/hooks/useLanguage';

interface ChangeAppointmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newDate: string, newTime: string) => void | Promise<void>;
  originalDate?: string;
  isProcessing?: boolean;
}

const ChangeAppointmentPopup: React.FC<ChangeAppointmentPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  originalDate,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const { isArabic } = useLanguage();

  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  const formatOriginalDate = () => {
    if (!originalDate) return '-';
    const date = new Date(originalDate);
    const dayName = date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    return `${dayName} ${dateStr}`;
  };

  const handleConfirm = async () => {
    let hasError = false;
    if (!newDate.trim()) {
      setDateError(t('common.validation.required'));
      hasError = true;
    }
    if (!newTime.trim()) {
      setTimeError(t('common.validation.required'));
      hasError = true;
    }
    if (hasError) return;

    await onConfirm(newDate, newTime);
  };

  const handleClose = () => {
    setNewDate('');
    setNewTime('');
    setDateError('');
    setTimeError('');
    onClose();
  };

  return (
    <Modal
      placement="end"
      isOpen={isOpen}
      onClose={handleClose}
      title={t('studentApplications.modals.changeAppointmentTitle')}
      size="sm"
    >
      <div className="flex flex-col rounded-lg border border-gray-200 p-4">
        {/* Original date display */}
        {originalDate && (
          <div className="mb-4 text-start text-sm text-gray-600">
            <span className="font-semibold">
              {t('studentApplications.modals.originalAppointment')}:
            </span>{' '}
            <span>{formatOriginalDate()}</span>
          </div>
        )}

        {/* New date picker */}
        <div className="mb-4">
          <Input
            type="date"
            label={`${t('studentApplications.modals.newAppointmentDate')} *`}
            value={newDate}
            onChange={(e) => {
              setNewDate(e.target.value);
              if (dateError) setDateError('');
            }}
            placeholder={t('studentApplications.modals.selectNewDate')}
            icon={<FaRegCalendarAlt className="h-4 w-4" />}
            error={dateError}
          />
        </div>

        {/* New time picker */}
        <div className="mb-2">
          <Input
            type="time"
            label={`${t('studentApplications.modals.appointmentTime')} *`}
            value={newTime}
            onChange={(e) => {
              setNewTime(e.target.value);
              if (timeError) setTimeError('');
            }}
            placeholder={t('studentApplications.modals.selectNewTime')}
            icon={<CustomImage src={ClockIcon} alt="clock" className="h-4 w-4" />}
            className="flex justify-end"
            error={timeError}
          />
        </div>
      </div>

      {/* Action buttons */}
      <PopupFooter className="flex w-full gap-3">
        <Button variant="outline" fullWidth onClick={handleClose} disabled={isProcessing}>
          {t('common.cancel')}
        </Button>
        <Button variant="success" fullWidth onClick={handleConfirm} loading={isProcessing}>
          {t('studentApplications.modals.change')}
        </Button>
      </PopupFooter>
    </Modal>
  );
};

export default ChangeAppointmentPopup;
