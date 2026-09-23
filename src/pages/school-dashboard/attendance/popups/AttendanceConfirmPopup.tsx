import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import CustomImage from '@/shared/components/CustomImage';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';
import ClockIcon from '@gradex/assets/icons/Clock.svg';

interface AttendanceConfirmPopupProps {
  open: boolean;
  type: 'present' | 'absent' | 'late';
  isBulk: boolean;
  personName?: string;
  personType?: 'student' | 'employee';
  onConfirm: (time?: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function AttendanceConfirmPopup({
  open,
  type,
  isBulk,
  personName,
  personType = 'student',
  onConfirm,
  onCancel,
  isProcessing,
}: AttendanceConfirmPopupProps) {
  const { t } = useTranslation();
  const [lateTime, setLateTime] = useState('');

  useEffect(() => {
    if (open) {
      setLateTime('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (type === 'late') {
      onConfirm(lateTime);
    } else {
      onConfirm();
    }
  };

  const getMessage = () => {
    if (type === 'late') {
      return isBulk ? t('attendance.confirmAllLateTitle') : t('attendance.confirmLateTitle');
    }

    if (isBulk) {
      return type === 'present'
        ? t('attendance.confirmAllPresent')
        : t('attendance.confirmAllAbsent');
    }

    if (personType === 'employee') {
      return type === 'present'
        ? t('attendance.confirmEmployeePresent', { name: personName })
        : t('attendance.confirmEmployeeAbsent', { name: personName });
    }

    return type === 'present'
      ? t('attendance.confirmPresent', { name: personName })
      : t('attendance.confirmAbsent', { name: personName });
  };

  return (
    <Modal isOpen={open} onClose={onCancel} size="sm" showHeader={false}>
      <button
        onClick={onCancel}
        className="absolute inset-e-4 top-4 rounded-xl border border-[#DDE0E0] p-2 transition-opacity hover:opacity-80"
        aria-label={t('common.cancel')}
      >
        <CustomImage src={XmarkCircleGrayIcon} alt="Close" className="h-5 w-5" />
      </button>

      <div className="flex flex-col">
        <p
          className={`my-6 ${type === 'late' ? 'py-3' : 'py-6'} text-center text-sm font-medium text-black-900 md:text-base`}
        >
          {getMessage()}
        </p>

        {type === 'late' && (
          <div className="mb-6">
            <label className="mb-2 block text-start text-sm font-medium text-black-900">
              {t('attendance.time')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={lateTime}
              onChange={(e) => setLateTime(e.target.value)}
              placeholder={t('attendance.selectTime')}
              icon={<img src={ClockIcon} alt="" className="h-5 w-5" />}
            />
          </div>
        )}

        <div className="flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={onCancel} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="success"
            fullWidth
            onClick={handleConfirm}
            disabled={isProcessing || (type === 'late' && !lateTime)}
            loading={isProcessing}
          >
            {isProcessing ? t('common.processing') : t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
