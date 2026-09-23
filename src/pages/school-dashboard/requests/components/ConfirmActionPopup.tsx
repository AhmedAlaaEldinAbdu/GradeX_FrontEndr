import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface ConfirmActionPopupProps {
  open: boolean;
  /** Big illustrative icon (e.g. BigSuccess / XMarkDanger). */
  iconSrc: string;
  message: string;
  confirmLabel: string;
  /** Colour of the confirm button. */
  confirmVariant?: 'primary' | 'danger';
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRM_CLASSES: Record<'primary' | 'danger', string> = {
  primary: 'bg-green-800 hover:bg-green-900',
  danger: 'bg-red-500 hover:bg-red-700',
};

const ConfirmActionPopup: React.FC<ConfirmActionPopupProps> = ({
  open,
  iconSrc,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  isProcessing = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { guardMutation } = useRoleAccess();

  if (!open) return null;

  return (
    <div
      className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity"
      onClick={onCancel}
    >
      <div
        className="relative w-[420px] rounded-3xl bg-white p-6 py-7 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute inset-e-4 top-4 rounded-xl border border-[#DDE0E0] p-2 transition-opacity hover:opacity-80"
          aria-label={t('common.cancel')}
        >
          <CustomImage src={XmarkCircleGrayIcon} alt="" className="h-6 w-6" />
        </button>

        <div className="my-6 flex flex-col items-center gap-7 py-6">
          <CustomImage src={iconSrc} alt="" className="h-[80px] w-[80px]" />
          <p className="w-full text-base font-medium text-black-900">{message}</p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="grow rounded-2xl border border-green-500 px-5 py-2 text-base font-medium text-green-500 transition-colors hover:bg-green-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => guardMutation(onConfirm)}
            disabled={isProcessing}
            className={`grow rounded-2xl px-5 py-2 text-base font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${CONFIRM_CLASSES[confirmVariant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionPopup;
