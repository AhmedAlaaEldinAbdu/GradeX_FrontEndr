import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Modal from '@/shared/popups/Modal';

interface AcceptApplicantPopupProps {
  open: boolean;
  applicantName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function AcceptApplicantPopup({
  open,
  applicantName,
  onConfirm,
  onCancel,
  isProcessing,
}: AcceptApplicantPopupProps) {
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    onCancel();
  }, [onCancel, isProcessing]);
  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      size="sm"
      showHeader={false}
      closeOnOverlayClick={!isProcessing}
    >
      <div className="relative text-center">
        <button
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute inset-s-0 top-0 text-xl text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          ✕
        </button>

        <div className="my-6 flex flex-col items-center gap-4 py-3">
          <p className="w-full font-medium text-gray-800 md:text-xl lg:w-4/5 lg:text-2xl">
            {t('jobAnnouncement.applicantsPage.confirmAccept', { name: applicantName })}
          </p>
          <p className="text-sm text-gray-500">
            {t('jobAnnouncement.applicantsPage.acceptDescription')}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            onClick={handleClose}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing} className="flex-1">
            {isProcessing ? t('common.processing') : t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
