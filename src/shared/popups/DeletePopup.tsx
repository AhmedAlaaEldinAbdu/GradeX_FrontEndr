import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '../components/CustomImage';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface DeletePopupProps {
  open: boolean;
  message: string;
  isMessageRaw?: boolean;
  itemName: string;
  extraMessage?: string;
  isExtraMessageRaw?: boolean;
  extraItemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  iconSrc: string;
  isProcessing?: boolean;
}

export default function DeletePopup({
  open,
  message,
  isMessageRaw = false,
  itemName,
  extraMessage,
  isExtraMessageRaw = false,
  extraItemName,
  onConfirm,
  onCancel,
  iconSrc,
  isProcessing,
}: DeletePopupProps) {
  const { t } = useTranslation();
  const { guardMutation } = useRoleAccess();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const resolvedItemName = itemName || '';

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

  const resolvedMessage = isMessageRaw ? message : t(`${message}`);
  const resolvedExtraMessage = extraMessage
    ? isExtraMessageRaw
      ? extraMessage
      : t(`${extraMessage}`)
    : '';
  const resolvedExtraItemName = extraItemName || '';

  return (
    <div className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-3xl bg-white p-6 py-7 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute end-4 top-4 rounded-xl border border-[#DDE0E0] p-2 transition-opacity hover:opacity-80"
          aria-label="Close"
        >
          <CustomImage src={XmarkCircleGrayIcon} alt="Close" className="h-6 w-6" />
        </button>

        <div className="my-6 flex flex-col items-center gap-7 py-6">
          <div className="flex justify-center">
            <CustomImage src={iconSrc} alt="Delete Icon" className="h-[80px] w-[80px]" />
          </div>

          <p className="w-[100%] text-sm font-medium text-[#0E1F1F]">
            {resolvedMessage} "{resolvedItemName}"
          </p>
          {resolvedExtraMessage && (
            <p className="mt-4 w-[100%] text-sm font-normal text-[#3A3A3A]">
              {resolvedExtraMessage}
              {resolvedExtraItemName ? ` "${resolvedExtraItemName}"` : ''}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleClose}
            className="flex-grow rounded-2xl border border-green-500 px-5 py-2 text-base font-medium text-green-500 transition-colors duration-200 hover:bg-green-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => guardMutation(onConfirm)}
            disabled={isProcessing}
            className="flex-grow rounded-2xl bg-red-500 px-5 py-2 text-base font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? t('common.deleting') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
