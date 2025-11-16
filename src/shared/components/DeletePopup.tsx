import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DeletePopupProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  iconSrc: string;
  isDeleting?: boolean;
}

export default function DeletePopup({
  message,
  onConfirm,
  onCancel,
  iconSrc,
  isDeleting,
}: DeletePopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, 200);
  };

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
          className="absolute left-3 top-2 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="my-6 flex flex-col items-center gap-7 py-3">
          <div className="flex justify-center">
            <img
              src={iconSrc}
              alt="Delete Icon"
              className="h-[120px] w-[120px] lg:h-[150px] lg:w-[150px]"
            />
          </div>

          <p className="w-[100%] font-medium text-gray-800 md:text-xl lg:w-[75%] lg:text-2xl">
            {t(`${message}`)}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleClose}
            className="flex-grow rounded-xl border border-green-700 px-5 py-2 text-green-700 transition-colors duration-200 hover:bg-green-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-grow rounded-xl bg-red-600 px-5 py-2 text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? t('common.deleting') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
