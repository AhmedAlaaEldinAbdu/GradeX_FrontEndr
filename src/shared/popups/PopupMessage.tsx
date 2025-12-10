import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface PopupMessageProps {
  open: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  iconSrc?: string;
  autoClose?: boolean;
  duration?: number;
  onClose: () => void;
  navigateAfterClose?: string | -1;
}

export default function PopupMessage({
  open,
  type = 'info',
  message,
  iconSrc,
  autoClose = false,
  duration = 1500,
  onClose,
  navigateAfterClose,
}: PopupMessageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

    if (autoClose) {
      const timer = setTimeout(() => handleClose(), duration);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
    setTimeout(() => {
      if (navigateAfterClose) {
        if (navigateAfterClose === -1) {
          navigate(-1);
        } else {
          navigate(navigateAfterClose);
        }
      }
    }, 600);
  };

  const typeColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-blue-600',
  }[type];

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

        <div className="my-6 flex flex-col items-center gap-7 py-3">
          {iconSrc && (
            <CustomImage
              src={iconSrc}
              alt="Popup Icon"
              className="h-[120px] w-[120px] lg:h-[150px] lg:w-[150px]"
            />
          )}
          <p className="w-[100%] font-medium text-gray-800 md:text-lg lg:w-[75%] lg:text-xl">
            {t(message)}
          </p>
        </div>

        {!autoClose && (
          <button
            onClick={handleClose}
            className={`rounded-xl ${typeColors} px-8 py-2 text-white transition-colors duration-200 hover:opacity-90`}
          >
            {t('common.ok')}
          </button>
        )}
      </div>
    </div>
  );
}
