import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import { FaTimes } from 'react-icons/fa';

interface NotPassedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isProcessing?: boolean;
}

const NotPassedModal: React.FC<NotPassedModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(true);
      return;
    }
    onConfirm(reason);
    setReason('');
    setError(false);
  };

  const handleClose = () => {
    setReason('');
    setError(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showHeader={false} size="sm">
      <div className="flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute start-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Red X icon */}
        <div className="mb-6 mt-4 flex h-24 w-24 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-24 w-24">
            <path
              d="M20 20 L80 80"
              stroke="#ef4444"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M80 20 L20 80"
              stroke="#f87171"
              strokeWidth="16"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          {t('studentApplications.modals.notPassedConfirm')}
        </h2>

        {/* Rejection reason field */}
        <div className="mb-6 w-full">
          <label className="mb-2 block text-start text-sm font-medium text-gray-700">
            {t('common.rejectionReason')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(false);
            }}
            placeholder={t('common.enterRejectionReason')}
            className={`w-full rounded-xl border px-4 py-3 text-start text-sm outline-none transition-colors ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                : 'border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-200'
            }`}
          />
          {error && (
            <p className="mt-1 text-start text-xs text-red-500">
              {t('common.rejectionReasonRequired')}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex w-full gap-3">
          <Button variant="danger" fullWidth onClick={handleConfirm} loading={isProcessing}>
            {t('studentApplications.actions.notPassed')}
          </Button>
          <Button variant="outline" fullWidth onClick={handleClose} disabled={isProcessing}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotPassedModal;
