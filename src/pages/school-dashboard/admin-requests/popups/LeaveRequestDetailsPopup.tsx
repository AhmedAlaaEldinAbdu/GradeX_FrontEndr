import PopupFooter from '@/shared/popups/PopupFooter';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import Modal from '@/shared/popups/Modal';

import EyeDarkBlueIcon from '@gradex/assets/icons/EyeDarkBlue.svg';

type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeAvatar: string | null;
  status: LeaveRequestStatus;
  leaveType: string;
  leaveDays: number;
  leaveFrom: string;
  leaveTo: string;
  time?: string | null;
  attachmentUrl: string | null;
}

interface LeaveRequestDetailsPopupProps {
  isOpen: boolean;
  request: LeaveRequest | null;
  onClose: () => void;
  onApprove: (request: LeaveRequest) => void;
  onReject: (request: LeaveRequest) => void;
}

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '--';
  return String(value);
};

const LeaveRequestDetailsPopup: React.FC<LeaveRequestDetailsPopupProps> = ({
  isOpen,
  request,
  onClose,
  onApprove,
  onReject,
}) => {
  const { t } = useTranslation();

  if (!request) return null;

  const statusConfig = {
    pending: {
      label: t('adminRequests.leave.status.pending'),
      className: 'bg-[#FEF8E6] text-[#D99A00]',
    },
    approved: {
      label: t('adminRequests.leave.status.approved'),
      className: 'bg-[#E8F8F0] text-[#30B97E]',
    },
    rejected: {
      label: t('adminRequests.leave.status.rejected'),
      className: 'bg-[#FCE8E8] text-[#F04444]',
    },
  } as const;

  return (
    <Modal
      placement="end"
      isOpen={isOpen}
      onClose={onClose}
      title={t('adminRequests.leave.detailsTitle')}
      size="md"
      contentClassName="px-12 pb-8"
    >
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-black-900">
            {t('adminRequests.leave.statusLabel')}:
          </span>
          <span
            className={`inline-flex rounded-full px-5 py-2 text-base font-medium ${
              statusConfig[request.status].className
            }`}
          >
            {statusConfig[request.status].label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-black-900">
            {t('adminRequests.leave.employeeName')}:
          </span>

          <div className="flex items-center gap-3">
            <IconButton variant="blue" ariaLabel={t('common.view')}>
              <CustomImage src={EyeDarkBlueIcon} alt="" className="h-6 w-6" />
            </IconButton>
            <span className="text-lg text-[#646969]">{displayValue(request.employeeName)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-black-900">
            {t('adminRequests.leave.requestDate')}:
          </span>
          <span className="text-lg text-[#646969]">{displayValue(request.leaveFrom)}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-black-900">
            {t('adminRequests.leave.time')}:
          </span>
          <span className="text-lg text-[#646969]">{displayValue(request.time)}</span>
        </div>

        {request.status === 'pending' && (
          <PopupFooter className="flex justify-end gap-5">
            <Button
              variant="outlineDanger"
              className="min-w-[140px]"
              onClick={() => onReject(request)}
            >
              {t('common.reject')}
            </Button>
            <Button variant="success" className="min-w-[140px]" onClick={() => onApprove(request)}>
              {t('common.accept')}
            </Button>
          </PopupFooter>
        )}
      </div>
    </Modal>
  );
};

export default LeaveRequestDetailsPopup;
