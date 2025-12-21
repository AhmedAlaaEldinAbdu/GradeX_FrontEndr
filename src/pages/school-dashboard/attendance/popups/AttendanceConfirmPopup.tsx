import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lateTime, setLateTime] = useState('');

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  }, [onCancel]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
      setLateTime('');
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

  const handleConfirm = () => {
    if (type === 'late') {
      onConfirm(lateTime);
    } else {
      onConfirm();
    }
  };

  const getMessage = () => {
    if (type === 'late') {
      return t('attendance.confirmLateTitle');
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-2xl bg-white p-6 py-7 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute start-3 top-2 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="my-6 flex flex-col items-center gap-4 py-3">
          <p className="w-[100%] font-medium text-gray-800 md:text-xl lg:w-[85%] lg:text-2xl">
            {getMessage()}
          </p>

          {/* Time input for late action */}
          {type === 'late' && (
            <div className="w-full px-4">
              <label className="mb-2 block text-start text-sm text-gray-600">
                {t('attendance.time')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={lateTime}
                  onChange={(e) => setLateTime(e.target.value)}
                  placeholder={t('attendance.selectTime')}
                  className="h-12 w-full rounded-lg border border-gray-300 px-4 text-end text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleClose}
            className="flex-grow rounded-xl border border-green-700 px-5 py-3 text-green-700 transition-colors duration-200 hover:bg-green-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || (type === 'late' && !lateTime)}
            className="flex-grow rounded-xl bg-green-700 px-5 py-3 text-white transition-colors duration-200 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? t('common.processing') : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
