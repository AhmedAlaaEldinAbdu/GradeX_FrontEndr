import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '../components/CustomImage';

interface DeletePopupProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  iconSrc: string;
  isProcessing?: boolean;
  selectedItemName?: string;
}

export default function DeletePopup({
  open,
  message,
  onConfirm,
  onCancel,
  iconSrc,
  isProcessing,
  selectedItemName = '',
}: DeletePopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
  }, [open]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

  if (!open) return null;

  return (
    <div className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-2xl bg-white p-6 py-7 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute start-3 top-2 text-xl text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <div className="my-6 flex flex-col items-center gap-7 py-3">
          <div className="flex justify-center">
            <CustomImage
              src={iconSrc}
              alt="Delete Icon"
              className="h-[120px] w-[120px] lg:h-[150px] lg:w-[150px]"
            />
          </div>

          <p className="w-[100%] font-medium text-black-900 md:text-xl lg:w-[75%] lg:text-2xl">
            {t(`${message}`)} "{selectedItemName}"
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleClose}
            className="flex-grow rounded-xl border border-green-500 px-5 py-2 text-green-500 transition-colors duration-200 hover:bg-green-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-grow rounded-xl bg-red-500 px-5 py-2 text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? t('common.deleting') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
