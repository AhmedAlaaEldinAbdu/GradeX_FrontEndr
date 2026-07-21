import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CustomImage from '@/shared/components/CustomImage';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';

interface DeleteLessonPopupProps {
  open: boolean;
  lessonName: string;
  onConfirm: (applyToAllWeeks: boolean) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function DeleteLessonPopup({
  open,
  lessonName,
  onConfirm,
  onCancel,
  isProcessing,
}: DeleteLessonPopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(false);

  const handleClose = useCallback(() => {
    if (isProcessing) return;

    setIsVisible(false);
    setTimeout(onCancel, 200);
  }, [isProcessing, onCancel]);

  useEffect(() => {
    if (open) {
      setApplyToAllWeeks(false);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClose, open]);

  if (!open) return null;

  return (
    <div className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300">
      <div
        ref={popupRef}
        className={`relative w-[420px] transform rounded-3xl bg-white p-6 py-7 text-center shadow-lg transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute end-4 top-4 rounded-xl border border-[#DDE0E0] p-2 transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('common.close')}
        >
          <CustomImage src={XmarkCircleGrayIcon} alt="" className="h-6 w-6" />
        </button>

        <div className="my-6 flex flex-col items-center gap-7 py-6">
          <div className="flex justify-center">
            <CustomImage src={BigTrashIcon} alt="" className="h-[80px] w-[80px]" />
          </div>

          <p className="w-full text-sm font-medium text-[#0E1F1F]">
            {t('weeklyCalendar.confirmDeleteLessonWithName', {
              lessonName: lessonName || t('weeklyCalendar.lesson'),
            })}
          </p>

          <div className="w-full text-start">
            <p className="text-sm font-medium text-[#0E1F1F]">
              {t('weeklyCalendar.deleteLessonScope')}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-normal text-[#3A3A3A]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="deleteLessonScope"
                  checked={!applyToAllWeeks}
                  onChange={() => setApplyToAllWeeks(false)}
                  disabled={isProcessing}
                  className="h-4 w-4 accent-green-500"
                />
                <span>{t('weeklyCalendar.thisWeekOnly')}</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="deleteLessonScope"
                  checked={applyToAllWeeks}
                  onChange={() => setApplyToAllWeeks(true)}
                  disabled={isProcessing}
                  className="h-4 w-4 accent-green-500"
                />
                <span>{t('weeklyCalendar.allWeeks')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-grow rounded-2xl border border-green-500 px-5 py-2 text-base font-medium text-green-500 transition-colors duration-200 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>

          <button
            type="button"
            onClick={() => onConfirm(applyToAllWeeks)}
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
