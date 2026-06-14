import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import { EarlyLeaveStatus, type EarlyLeaveRequestDto } from '@/services/api/requests/requests.types';

const STATUS_BADGE_CLASSES: Record<EarlyLeaveStatus, string> = {
  [EarlyLeaveStatus.Pending]: 'bg-orange-100 text-orange-700',
  [EarlyLeaveStatus.Accepted]: 'bg-green-100 text-green-700',
  [EarlyLeaveStatus.Rejected]: 'bg-red-100 text-red-700',
};

const STATUS_LABEL_KEYS: Record<EarlyLeaveStatus, string> = {
  [EarlyLeaveStatus.Pending]: 'requests.earlyLeave.status.pending',
  [EarlyLeaveStatus.Accepted]: 'requests.earlyLeave.status.accepted',
  [EarlyLeaveStatus.Rejected]: 'requests.earlyLeave.status.rejected',
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[#0E1F1F]">{label}:</span>
      <div className="text-sm font-normal text-[#646969]">{children}</div>
    </div>
  );
}

type EarlyLeaveDetailsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  request: EarlyLeaveRequestDto | null;
};

export default function EarlyLeaveDetailsPopup({
  isOpen,
  onClose,
  request,
}: EarlyLeaveDetailsPopupProps) {
  const { t } = useTranslation();

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('requests.earlyLeave.detailsTitle')} size="sm">
      <div className="flex flex-col gap-5">
        <DetailRow label={t('requests.requestStatus')}>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASSES[request.status]}`}
          >
            {t(STATUS_LABEL_KEYS[request.status])}
          </span>
        </DetailRow>

        <DetailRow label={t('requests.earlyLeave.studentName')}>
          <div className="flex items-center gap-2">
            <span>{request.studentName}</span>
            <IconButton variant="blue" ariaLabel={t('common.view')} className="h-8 w-8">
              <CustomImage src={EyeStyledIcon} alt="" className="h-5 w-5" />
            </IconButton>
          </div>
        </DetailRow>

        <DetailRow label={t('requests.earlyLeave.stage')}>{request.stage}</DetailRow>
        <DetailRow label={t('requests.earlyLeave.classroom')}>{request.classroom}</DetailRow>
        <DetailRow label={t('requests.earlyLeave.requestDate')}>{request.date}</DetailRow>
        <DetailRow label={t('requests.earlyLeave.time')}>{request.time}</DetailRow>
        <DetailRow label={t('requests.earlyLeave.duration')}>{request.duration}</DetailRow>
      </div>
    </Modal>
  );
}
