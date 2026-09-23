import { useToast } from '@/shared/context/ToastContext';
import TextArea from '@/shared/components/TextArea';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EditRequestPopupProps {
  open: boolean;
  onConfirm: (message: string) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function EditRequestPopup({
  open,
  onConfirm,
  onCancel,
  isProcessing,
}: EditRequestPopupProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
      setMessage('');
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

  const handleSubmit = () => {
    if (!message.trim()) {
      showToast({
        message: t('schools.editRequestMessageRequired'),
        type: 'error',
        duration: 3000,
      });
      return;
    }
    onConfirm(message);
  };

  if (!open) return null;

  return (
    <div className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 left-3 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-5">
          <div className="mt-5 flex h-[100px] items-center justify-center">
            <p className="text-2xl font-medium text-gray-800">{t('schools.editRequest')}</p>
          </div>

          <div className="mb-4 w-full text-right">
            <label className="required mb-2 block font-medium text-gray-700">
              {t('schools.editRequest')}
            </label>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('schools.enterEditRequest')}
              rows={3}
            />
          </div>

          <div className="flex w-full justify-center gap-3">
            <button
              onClick={handleClose}
              className="grow rounded-xl border border-green-700 px-5 py-2 text-green-700 transition-colors duration-200 hover:bg-green-50"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="grow rounded-xl bg-green-700 px-5 py-2 text-white transition-colors duration-200 hover:bg-green-800 disabled:opacity-50"
            >
              {isProcessing ? t('common.sending') : t('common.send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
