import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';

import BigSuccessIcon from '@gradex/assets/icons/BigSuccess.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';

interface LeaveRequestDecisionPopupProps {
  open: boolean;
  type: 'approve' | 'reject';
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LeaveRequestDecisionPopup: React.FC<LeaveRequestDecisionPopupProps> = ({
  open,
  type,
  isProcessing = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!open) return null;

  const isApprove = type === 'approve';

  return (
    <div
      className="bg-black/60 fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-[520px] rounded-3xl bg-white px-8 py-9 text-center shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute inset-s-6 top-6 rounded-xl border border-[#DDE0E0] p-2 transition-opacity hover:opacity-80"
          aria-label={t('common.cancel')}
        >
          <CustomImage src={XmarkCircleGrayIcon} alt="" className="h-6 w-6" />
        </button>

        <div className="mt-12 flex flex-col items-center gap-7">
          <CustomImage
            src={isApprove ? BigSuccessIcon : BigTrashIcon}
            alt=""
            className="h-[96px] w-[96px]"
          />

          <p className="text-lg font-semibold text-black-900">
            {isApprove
              ? t('adminRequests.leave.approvePopup.title')
              : t('adminRequests.leave.rejectPopup.title')}
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-5">
          <Button
            variant="outline"
            className="min-w-[180px]"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {t('common.cancel')}
          </Button>

          <Button
            variant={isApprove ? 'success' : 'danger'}
            className="min-w-[180px]"
            onClick={onConfirm}
            loading={isProcessing}
          >
            {isApprove
              ? t('adminRequests.leave.approvePopup.confirm')
              : t('adminRequests.leave.rejectPopup.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestDecisionPopup;
