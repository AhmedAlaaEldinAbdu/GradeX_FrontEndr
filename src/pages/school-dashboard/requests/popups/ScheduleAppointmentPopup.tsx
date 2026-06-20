import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import { FaRegCalendarAlt } from 'react-icons/fa';
import CustomImage from '@/shared/components/CustomImage';
import ClockIcon from '@gradex/assets/icons/Clock.svg';

interface ScheduleAppointmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string) => void;
}

const ScheduleAppointmentPopup: React.FC<ScheduleAppointmentPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  const handleConfirm = () => {
    let hasError = false;
    if (!date.trim()) {
      setDateError(t('common.validation.required'));
      hasError = true;
    }
    if (!time.trim()) {
      setTimeError(t('common.validation.required'));
      hasError = true;
    }
    if (hasError) return;

    onConfirm(date, time);
    setDate('');
    setTime('');
    setDateError('');
    setTimeError('');
  };

  const handleClose = () => {
    setDate('');
    setTime('');
    setDateError('');
    setTimeError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('studentApplications.modals.scheduleTitle')}
      size="sm"
    >
      <div className="flex flex-col">
        {/* Date & Time inside a bordered card */}
        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          {/* Appointment Date */}
          <div className="mb-5">
            <Input
              type="date"
              label={`${t('studentApplications.modals.appointmentDate')} *`}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (dateError) setDateError('');
              }}
              placeholder={t('studentApplications.modals.selectDate')}
              error={dateError}
              icon={<FaRegCalendarAlt />}
            />
          </div>

          {/* Appointment Time */}
          <div>
            <Input
              type="time"
              label={`${t('studentApplications.modals.appointmentTime')} *`}
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (timeError) setTimeError('');
              }}
              placeholder={t('studentApplications.modals.selectTime')}
              error={timeError}
              icon={<CustomImage src={ClockIcon} className="h-5 w-5 text-gray-400" />}
              className="flex justify-end"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="success" fullWidth onClick={handleConfirm}>
            {t('studentApplications.modals.schedule')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleAppointmentPopup;
