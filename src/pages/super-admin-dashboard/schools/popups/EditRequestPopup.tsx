import ToastMessage from '@/shared/components/ToastMessage';
import { useToast } from '@/shared/context/ToastContext';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EditRequestPopupProps {
  onConfirm: (message: string) => void;
  onCancel: () => void;
}

export default function EditRequestPopup({ onConfirm, onCancel }: EditRequestPopupProps) {
  const { t } = useTranslation();
  const { show } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  const handleSubmit = () => {
    onConfirm(message);
    show({
      message: 'schools.editRequestSentSuccessfully',
      type: 'success',
      duration: 3000,
      position: 'top-left',
    });
  };

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
          <div className="mt-5 flex h-[100px] items-center justify-center">
            <p className="text-2xl font-medium text-gray-800">{t('schools.editRequest')}</p>
          </div>

          <div className="mb-4 w-full text-right">
            <label className="required mb-2 block font-medium text-gray-700">
              {t('schools.editRequest')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('schools.enterEditRequest')}
              rows={3}
              className="w-full resize-none rounded-lg border px-4 py-2 text-gray-700 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
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
              onClick={handleSubmit}
              className="flex-grow rounded-xl bg-green-700 px-5 py-2 text-white transition-colors duration-200 hover:bg-green-800"
            >
              {t('common.send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
