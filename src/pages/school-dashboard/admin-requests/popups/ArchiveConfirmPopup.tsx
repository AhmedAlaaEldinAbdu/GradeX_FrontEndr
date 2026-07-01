import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import Button from '@/shared/components/Button';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';

interface ArchiveConfirmPopupProps {
  open: boolean;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ArchiveConfirmPopup: React.FC<ArchiveConfirmPopupProps> = ({
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
          className="absolute start-4 top-4 rounded-xl border border-[#DDE0E0] p-2 transition-opacity hover:opacity-80"
          aria-label={t('common.cancel')}
        >
          <CustomImage src={XmarkCircleGrayIcon} alt="" className="h-6 w-6" />
        </button>

        <div className="mb-8 mt-6 flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-[#0E1F1F]">
            {t('adminRequests.jobApplication.archivePopup.title')}
          </p>
          <p className="text-sm font-normal text-[#646969]">
            {t('adminRequests.jobApplication.archivePopup.subtitle')}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            fullWidth
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="success"
            onClick={onConfirm}
            loading={isProcessing}
            fullWidth
          >
            {t('adminRequests.jobApplication.archivePopup.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveConfirmPopup;
