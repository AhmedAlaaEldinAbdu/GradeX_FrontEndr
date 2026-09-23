import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import Button from '@/shared/components/Button';
import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';

interface AcceptConfirmPopupProps {
  open: boolean;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AcceptConfirmPopup: React.FC<AcceptConfirmPopupProps> = ({
  open,
  isProcessing = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div
      className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center transition-opacity"
      onClick={onCancel}
    >
      <div
        className="relative w-[420px] rounded-3xl bg-white p-6 py-8 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute inset-s-4 top-4 rounded-xl border border-[#DDE0E0] p-2 transition-opacity hover:opacity-80"
          aria-label={t('common.cancel')}
        >
          <CustomImage src={XmarkCircleGrayIcon} alt="" className="h-6 w-6" />
        </button>

        <div className="my-6 flex flex-col items-center gap-7 py-2">
          <CustomImage src={BigSuccessIcon} alt="" className="h-[80px] w-[80px]" />
          <p className="w-full text-base font-medium text-black-900">
            {t('adminRequests.jobApplication.acceptPopup.title')}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing} fullWidth>
            {t('common.cancel')}
          </Button>
          <Button variant="success" onClick={onConfirm} loading={isProcessing} fullWidth>
            {t('adminRequests.jobApplication.acceptPopup.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AcceptConfirmPopup;
