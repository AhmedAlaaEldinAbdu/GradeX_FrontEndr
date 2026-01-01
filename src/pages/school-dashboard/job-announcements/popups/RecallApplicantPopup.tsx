import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Modal from '@/shared/popups/Modal';

interface RecallApplicantPopupProps {
  open: boolean;
  applicantName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const RecallApplicantPopup = ({
  open,
  applicantName,
  onConfirm,
  onCancel,
  isProcessing = false,
}: RecallApplicantPopupProps) => {
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    if (isProcessing) {
      return;
    }
    onCancel();
  }, [isProcessing, onCancel]);

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      size="sm"
      showHeader={false}
      closeOnOverlayClick={!isProcessing}
      contentClassName="p-0"
    >
      <button
        type="button"
        onClick={handleClose}
        disabled={isProcessing}
        className="absolute start-4 top-4 text-2xl text-gray-400 transition hover:text-gray-600 disabled:cursor-not-allowed"
        aria-label={t('common.close')}
      >
        ✕
      </button>

      <div className="flex flex-col gap-3 pb-8 pt-6">
        <p className="text-xl font-semibold text-gray-900">
          {t('jobAnnouncement.applicantsPage.confirmRecall')}
        </p>
        <p className="text-sm text-gray-500">
          {t('jobAnnouncement.applicantsPage.recallDescription')}
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 md:flex-row-reverse">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isProcessing}
          className="flex-1 border-emerald-700 text-emerald-700"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className="flex-1 bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-200"
        >
          {isProcessing ? t('common.processing') : t('common.confirm')}
        </Button>
      </div>
    </Modal>
  );
};

export default RecallApplicantPopup;
