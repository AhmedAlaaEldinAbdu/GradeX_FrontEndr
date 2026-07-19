import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@/shared/components/Button';
import Modal from '@/shared/popups/Modal';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

import { AdminMessageStatus, type AdminMessageDto } from '../admin-requests.types';

const STATUS_BADGE_CLASSES: Record<AdminMessageStatus, string> = {
  [AdminMessageStatus.Pending]: 'bg-orange-100 text-orange-700',
  [AdminMessageStatus.Sent]: 'bg-purple-100 text-purple-700',
  [AdminMessageStatus.Viewed]: 'bg-green-100 text-green-700',
  [AdminMessageStatus.Replied]: 'bg-blue-100 text-blue-700',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

const getStatusLabelKey = (status: AdminMessageStatus) => {
  switch (status) {
    case AdminMessageStatus.Pending:
      return 'adminRequests.messages.status.pending';
    case AdminMessageStatus.Sent:
      return 'requests.status.sent';
    case AdminMessageStatus.Viewed:
      return 'adminRequests.messages.status.viewed';
    case AdminMessageStatus.Replied:
      return 'requests.status.replied';
    default:
      return 'adminRequests.messages.status.pending';
  }
};

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

const EyeBadge: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => {
  if (!onClick) {
    return null;
  }

  return (
    <IconButton variant="blue" ariaLabel={label} className="h-9 w-9" onClick={onClick}>
      <CustomImage src={EyeStyledIcon} alt={label} className="h-5 w-5" />
    </IconButton>
  );
};

const PartyValue: React.FC<{
  name: string;
  avatarPath: string | null;
  profilePath: string | null;
  isSchool?: boolean;
  eyeLabel: string;
}> = ({ name, avatarPath, profilePath, isSchool, eyeLabel }) => {
  const navigate = useNavigate();

  if (isSchool) {
    return <span className="text-sm font-normal text-[#646969]">{displayValue(name)}</span>;
  }

  return (
    <>
      <UserAvatarName name={displayValue(name)} avatarSrc={avatarPath} align="center" />
      <EyeBadge label={eyeLabel} onClick={profilePath ? () => navigate(profilePath) : undefined} />
    </>
  );
};

export interface MessageDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: AdminMessageDto | null;
  isLoading?: boolean;
  onMarkViewed?: (message: AdminMessageDto) => Promise<void> | void;
  isMarkingViewed?: boolean;
}

const MessageDetailsPopup: React.FC<MessageDetailsPopupProps> = ({
  isOpen,
  onClose,
  message,
  isLoading = false,
  onMarkViewed,
  isMarkingViewed = false,
}) => {
  const { t } = useTranslation();

  if (!message && !isLoading) {
    return null;
  }
  const schoolLabel = t('requests.schoolLabel');
  const canMarkViewed =
    Boolean(onMarkViewed) &&
    message !== null &&
    message.status === AdminMessageStatus.Sent &&
    message.isViewed !== true;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isMarkingViewed ? () => undefined : onClose}
      title={t('adminRequests.messages.detailsTitle')}
      size="md"
    >
      {isLoading && !message ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#646969]">
          {t('common.loading')}
        </div>
      ) : message ? (
        <div className="space-y-6 px-2 pb-2">
          <DetailRow label={t('adminRequests.messages.columns.status')}>
            <span
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${STATUS_BADGE_CLASSES[message.status]}`}
            >
              {t(getStatusLabelKey(message.status))}
            </span>
          </DetailRow>

          <DetailRow label={t('adminRequests.messages.columns.sentFrom')}>
            <PartyValue
              name={message.sender.name || schoolLabel}
              avatarPath={message.sender.avatarPath}
              profilePath={message.sender.profilePath}
              isSchool={message.sender.isSchool}
              eyeLabel={t('common.view')}
            />
          </DetailRow>

          <DetailRow label={t('adminRequests.messages.columns.sentTo')}>
            <PartyValue
              name={message.recipient.name || schoolLabel}
              avatarPath={message.recipient.avatarPath}
              profilePath={message.recipient.profilePath}
              isSchool={message.recipient.isSchool}
              eyeLabel={t('common.view')}
            />
          </DetailRow>

          <DetailRow label={t('adminRequests.messages.columns.stage')}>
            <span className="text-sm font-normal text-[#646969]">
              {displayValue(message.stage)}
            </span>
          </DetailRow>

          <DetailRow label={t('adminRequests.messages.columns.classroom')}>
            <span className="text-sm font-normal text-[#646969]">
              {displayValue(message.classroom)}
            </span>
          </DetailRow>

          <DetailRow label={t('adminRequests.messages.columns.sentDate')}>
            <span className="text-sm font-normal text-[#646969]">
              {displayValue(message.sentDate) === '--' ? '--' : formatDate(message.sentDate)}
            </span>
          </DetailRow>

          <DetailRow label={t('adminRequests.messages.columns.content')}>
            <span className="text-sm font-normal text-[#646969]">
              {displayValue(message.messageContent)}
            </span>
          </DetailRow>

          {canMarkViewed && onMarkViewed ? (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isMarkingViewed}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                disabled={isMarkingViewed}
                onClick={async () => {
                  try {
                    await onMarkViewed(message);
                    onClose();
                  } catch {
                    // Keep the popup open; parent handlers own user feedback.
                  }
                }}
              >
                {isMarkingViewed
                  ? t('adminRequests.messages.actions.markingViewed')
                  : t('adminRequests.messages.actions.markViewed')}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
};

export default MessageDetailsPopup;
