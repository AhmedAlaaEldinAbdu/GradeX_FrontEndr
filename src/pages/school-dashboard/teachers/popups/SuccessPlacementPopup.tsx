import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';

interface SuccessPlacementPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function SuccessPlacementPopup({ open, onClose }: SuccessPlacementPopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setTimeout(() => setIsVisible(true), 10);
      // Auto close after 2 seconds
      const timer = setTimeout(() => handleClose(), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open, handleClose]);

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
          className="absolute start-3 top-3 text-xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="my-6 flex flex-col items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center">
            <CustomImage src={BigSuccessIcon} alt="success" className="h-full w-full" />
          </div>
          <p className="text-xl font-semibold text-gray-800">
            {t('teachers.placement.successMessage')}
          </p>
        </div>
      </div>
    </div>
  );
}
