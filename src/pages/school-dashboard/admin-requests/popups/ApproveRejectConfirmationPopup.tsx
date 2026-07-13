import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import XmarkCircleRedIcon from '@gradex/assets/icons/XmarkCircleRed.svg';
import Button from '@/shared/components/Button';

interface ApproveRejectConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'approve' | 'reject';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

const ApproveRejectConfirmationPopup: React.FC<ApproveRejectConfirmationPopupProps> = ({
  isOpen,
  onClose,
  type,
  onConfirm,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const config = {
    approve: {
      icon: CheckMarkIcon,
      message: t(
        'adminRequests.earlyLeave.confirmApprove',
        'Do you want to approve the employee request?'
      ),
      confirmButtonText: t('adminRequests.earlyLeave.approve', 'Approve'),
      confirmButtonClass: 'bg-green-600 hover:bg-green-700 text-white',
      containerClass: 'bg-green-50',
    },
    reject: {
      icon: XmarkCircleRedIcon,
      message: t(
        'adminRequests.earlyLeave.confirmReject',
        'Do you want to reject the employee request?'
      ),
      confirmButtonText: t('adminRequests.earlyLeave.reject', 'Reject'),
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      containerClass: 'bg-red-50',
    },
  };

  const current = config[type];

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error in confirmation:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-6">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <CustomImage src={current.icon} alt={type} className="h-16 w-16" />
        </div>

        {/* Message */}
        <p className="text-center text-base font-semibold text-[#0E1F1F]">{current.message}</p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-3">
          <Button onClick={handleConfirm} disabled={isLoading} className="flex-1">
            {isLoading ? t('common.processing') : t('common.confirm')}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveRejectConfirmationPopup;
