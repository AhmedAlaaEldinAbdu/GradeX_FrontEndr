import React from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import UserAvatarName from '@/shared/components/UserAvatarName';

import { AdminMessageStatus, type AdminMessageDto } from '../admin-requests.types';

const STATUS_BADGE_CLASSES: Record<AdminMessageStatus, string> = {
  [AdminMessageStatus.Pending]: 'bg-orange-100 text-orange-700',
  [AdminMessageStatus.Viewed]: 'bg-green-100 text-green-700',
};

const STATUS_LABEL_KEYS: Record<AdminMessageStatus, string> = {
  [AdminMessageStatus.Pending]: 'adminRequests.messages.status.pending',
  [AdminMessageStatus.Viewed]: 'adminRequests.messages.status.viewed',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => (
  <div className="flex items-center gap-3">
    <span className="text-base font-semibold text-[#0E1F1F]">{label}:</span>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

export interface MessageDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: AdminMessageDto | null;
  onMarkViewed?: (message: AdminMessageDto) => void;
}

const MessageDetailsPopup: React.FC<MessageDetailsPopupProps> = ({
  isOpen,
  onClose,
  message,
  onMarkViewed,
}) => {
  const { t } = useTranslation();

  if (!message) {
    return null;
  }

  const canMarkViewed = message.status === AdminMessageStatus.Pending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('adminRequests.messages.detailsTitle')}
      size="md"
    >
      <div className="space-y-6">
        <DetailRow label={t('adminRequests.messages.columns.status')}>
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${STATUS_BADGE_CLASSES[message.status]}`}
          >
            {t(STATUS_LABEL_KEYS[message.status])}
          </span>
        </DetailRow>

        <DetailRow label={t('adminRequests.messages.columns.sentFrom')}>
          <UserAvatarName
            name={message.sender.name}
            avatarSrc={message.sender.avatarPath}
            align="center"
          />
        </DetailRow>

        <DetailRow label={t('adminRequests.messages.columns.sentTo')}>
          {message.recipient.isSchool ? (
            <span className="text-sm font-normal text-[#646969]">{message.recipient.name}</span>
          ) : (
            <UserAvatarName
              name={message.recipient.name}
              avatarSrc={message.recipient.avatarPath}
              align="center"
            />
          )}
        </DetailRow>

        {message.stage ? (
          <DetailRow label={t('adminRequests.messages.columns.stage')}>
            <span className="text-sm font-normal text-[#646969]">{message.stage}</span>
          </DetailRow>
        ) : null}

        {message.classroom ? (
          <DetailRow label={t('adminRequests.messages.columns.classroom')}>
            <span className="text-sm font-normal text-[#646969]">{message.classroom}</span>
          </DetailRow>
        ) : null}

        <DetailRow label={t('adminRequests.messages.columns.sentDate')}>
          <span className="text-sm font-normal text-[#646969]">{formatDate(message.sentDate)}</span>
        </DetailRow>

        <DetailRow label={t('adminRequests.messages.columns.content')}>
          <span className="text-sm font-normal text-[#646969]">{message.messageContent}</span>
        </DetailRow>

        {canMarkViewed ? (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onMarkViewed?.(message);
                onClose();
              }}
            >
              {t('adminRequests.messages.actions.markViewed')}
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default MessageDetailsPopup;
