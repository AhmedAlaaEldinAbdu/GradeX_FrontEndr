import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextArea from '@/shared/components/TextArea';

interface RejectSchoolPopupProps {
  open: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function RejectSchoolPopup({
  open,
  onConfirm,
  onCancel,
  isProcessing,
}: RejectSchoolPopupProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [reason, setReason] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
      setReason('');
    } else {
      setIsVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  const handleConfirm = () => {
    onConfirm(reason);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute left-3 top-2 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-5">
          <div className="mt-5 flex h-[130px] items-center justify-center">
            <p className="w-[90%] text-2xl font-medium text-gray-800">
              {t('schools.areYouSureRejectSchool')}
            </p>
          </div>

          <div className="mb-4 w-full text-right">
            <label className="required mb-2 block font-medium text-gray-700">
              {t('schools.rejectionReason')}
            </label>
            <TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('schools.enterRejectionReason')}
              rows={3}
            />
          </div>

          <div className="flex w-full justify-center gap-3">
            <button
              onClick={handleClose}
              className="flex-grow rounded-xl border border-green-700 px-5 py-2 text-green-700 transition-colors duration-200 hover:bg-green-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-grow rounded-xl bg-red-600 px-5 py-2 text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50"
            >
              {isProcessing ? t('common.rejecting') : t('actions.reject')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
