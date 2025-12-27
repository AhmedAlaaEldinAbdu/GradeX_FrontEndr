import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ArchiveApplicantPopupProps {
  open: boolean;
  applicantName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function ArchiveApplicantPopup({
  open,
  applicantName,
  onConfirm,
  onCancel,
  isProcessing,
}: ArchiveApplicantPopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    setIsVisible(false);
    setTimeout(onCancel, 200);
  }, [onCancel, isProcessing]);

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
  }, [open, handleClose]);

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
          disabled={isProcessing}
          className="absolute start-3 top-2 text-xl text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          ✕
        </button>

        <div className="my-6 flex flex-col items-center gap-4 py-3">
          <p className="w-[100%] font-medium text-gray-800 md:text-xl lg:w-[85%] lg:text-2xl">
            {t('jobAnnouncement.applicantsPage.confirmArchive', { name: applicantName })}
          </p>
          <p className="text-sm text-gray-500">
            {t('jobAnnouncement.applicantsPage.archiveDescription')}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-grow rounded-xl border border-green-700 px-5 py-3 text-green-700 transition-colors duration-200 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-grow rounded-xl bg-green-700 px-5 py-3 text-white transition-colors duration-200 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? t('common.processing') : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
