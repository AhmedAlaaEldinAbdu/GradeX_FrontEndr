import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import { useToast } from '@/shared/context/ToastContext';
import SuccessIcon from '@gradex/assets/icons/CheckCircle.svg';
import CustomImage from '@/shared/components/CustomImage';

interface RestoreApplicationFromArchivePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreConfirm: () => Promise<void>;
  applicationName: string;
  applicationId: string;
}

const RestoreApplicationFromArchivePopup: React.FC<RestoreApplicationFromArchivePopupProps> = ({
  isOpen,
  onClose,
  onRestoreConfirm,
  applicationName,
  // applicationId is passed but not directly used; onRestoreConfirm handles the restore logic
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onRestoreConfirm();

      setShowSuccess(true);
      showToast({
        message: t('adminRequests.popup.restoreSuccess'),
        type: 'success',
      });

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.errorOccurred');
      showToast({
        message: errorMessage,
        type: 'error',
        isRaw: true,
      });
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <CustomImage src={SuccessIcon} alt="Success" className="h-12 w-12" />
          <div className="rounded-xl bg-green-50 px-6 py-4 text-center">
            <p className="text-sm font-medium text-green-700">
              {t('adminRequests.popup.restoreSuccess')}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question */}
          <div className="text-center">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              {t('adminRequests.popup.confirmRestore', {
                name: applicationName,
              })}
            </h2>
            <p className="text-sm text-gray-600">{t('adminRequests.popup.restoreDescription')}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-3">
            <Button onClick={handleConfirm} disabled={isProcessing} className="flex-1">
              {isProcessing ? t('common.processing') : t('common.confirm')}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1">
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RestoreApplicationFromArchivePopup;
