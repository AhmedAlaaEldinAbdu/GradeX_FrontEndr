import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import UserAvatarName from '@/shared/components/UserAvatarName';
import { useNavigate } from 'react-router-dom';

interface EarlyLeaveDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string;
    applicantName: string;
    applicantAvatar: string;
    time: string;
    duration: string;
  } | null;
}

const displayValue = (value: string | null | undefined) => value?.trim() || '--';

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
    <span className="text-base font-semibold text-[#0E1F1F]">{label}:</span>
    <div className="flex items-center gap-2 text-[#646969]">{children}</div>
  </div>
);

const EarlyLeaveDetailsPopup: React.FC<EarlyLeaveDetailsPopupProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const statusColors = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: t('adminRequests.earlyLeave.pending'),
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: t('adminRequests.earlyLeave.approved'),
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: t('adminRequests.earlyLeave.rejected'),
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('adminRequests.earlyLeave.detailsTitle') || 'تفاصيل طلب الخروج المبكر'}
      size="md"
    >
      {request ? (
        <div className="space-y-6 px-2 pb-2">
          {/* Status */}
          <DetailRow label={t('adminRequests.earlyLeave.status')}>
            <span
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${statusColors[request.status].bg} ${statusColors[request.status].text}`}
            >
              {statusColors[request.status].label}
            </span>
          </DetailRow>

          {/* Applicant */}
          <DetailRow label={t('adminRequests.earlyLeave.applicant')}>
            <UserAvatarName
              name={displayValue(request.applicantName)}
              avatarSrc={request.applicantAvatar}
              onView={() => navigate('#!')}
            />
          </DetailRow>

          {/* Request Date */}
          <DetailRow label={t('adminRequests.earlyLeave.requestDate')}>
            <span className="text-sm font-normal text-[#646969]">
              {displayValue(request.requestDate)}
            </span>
          </DetailRow>

          {/* Time */}
          <DetailRow label={t('adminRequests.earlyLeave.time')}>
            <span className="text-sm font-normal text-[#646969]">{displayValue(request.time)}</span>
          </DetailRow>
        </div>
      ) : null}
    </Modal>
  );
};

export default EarlyLeaveDetailsPopup;
