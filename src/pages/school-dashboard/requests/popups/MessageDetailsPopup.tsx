import React from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

import type { StudentRequestDto } from '@/services/api/requests/requests.types';
import { StudentRequestStatus } from '@/services/api/requests/requests.types';

const STATUS_BADGE_CLASSES: Record<StudentRequestStatus, string> = {
  [StudentRequestStatus.Sent]: 'bg-purple-100 text-purple-700',
  [StudentRequestStatus.Viewed]: 'bg-blue-100 text-blue-700',
  [StudentRequestStatus.Replied]: 'bg-green-100 text-green-700',
  [StudentRequestStatus.Pending]: 'bg-orange-100 text-orange-700',
};

const STATUS_LABEL_KEYS: Record<StudentRequestStatus, string> = {
  [StudentRequestStatus.Sent]: 'requests.status.sent',
  [StudentRequestStatus.Viewed]: 'requests.status.viewed',
  [StudentRequestStatus.Replied]: 'requests.status.replied',
  [StudentRequestStatus.Pending]: 'requests.status.pending',
};

const formatRequestDate = (value: string) => {
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

const EyeBadge: React.FC<{ label: string }> = ({ label }) => (
  <IconButton variant="blue" ariaLabel={label} className="h-9 w-9">
    <CustomImage src={EyeStyledIcon} alt={label} className="h-5 w-5" />
  </IconButton>
);

export interface MessageDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  request: StudentRequestDto | null;
  onMarkViewed?: (request: StudentRequestDto) => void;
  /** Translation key for the popup title (defaults to the message title). */
  titleKey?: string;
}

const MessageDetailsPopup: React.FC<MessageDetailsPopupProps> = ({
  isOpen,
  onClose,
  request,
  onMarkViewed,
  titleKey = 'requests.popup.title',
}) => {
  const { t } = useTranslation();

  if (!request) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(titleKey)} size="md">
      <div className="space-y-6">
        <DetailRow label={t('requests.requestStatus')}>
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${STATUS_BADGE_CLASSES[request.status]}`}
          >
            {t(STATUS_LABEL_KEYS[request.status])}
          </span>
        </DetailRow>

        {request.studentName ? (
          <DetailRow label={t('requests.popup.studentName')}>
            <span className="text-sm font-normal text-[#646969]">{request.studentName}</span>
            <EyeBadge label={t('requests.requestPreview')} />
          </DetailRow>
        ) : (
          <DetailRow label={t('requests.sentFrom')}>
            <span className="text-sm font-normal text-[#646969]">{request.senderName}</span>
          </DetailRow>
        )}

        <DetailRow label={t('requests.sentTo')}>
          {request.recipientAvatarPath ? (
            <UserAvatarName
              name={request.recipientName}
              avatarSrc={request.recipientAvatarPath}
              align="center"
            />
          ) : (
            <span className="text-sm font-normal text-[#646969]">{request.recipientName}</span>
          )}
          <EyeBadge label={t('requests.requestPreview')} />
        </DetailRow>

        {request.educationalStage ? (
          <DetailRow label={t('requests.popup.grade')}>
            <span className="text-sm font-normal text-[#646969]">{request.educationalStage}</span>
          </DetailRow>
        ) : null}

        {request.classrooms && request.classrooms.length > 0 ? (
          <DetailRow label={t('requests.popup.classroom')}>
            <div className="flex flex-wrap items-center gap-2">
              {request.classrooms.map((classroom) => (
                <span
                  key={classroom}
                  className="rounded-lg bg-[#DFF8ED] px-3 py-1 text-sm font-normal text-[#3A3A3A]"
                >
                  {classroom}
                </span>
              ))}
            </div>
          </DetailRow>
        ) : null}

        <DetailRow label={t('requests.messageDate')}>
          <span className="text-sm font-normal text-[#646969]">
            {formatRequestDate(request.created)}
          </span>
        </DetailRow>

        <DetailRow label={t('requests.messageContent')}>
          <span className="text-sm font-normal text-[#646969]">{request.messageContent}</span>
        </DetailRow>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onMarkViewed?.(request);
              onClose();
            }}
          >
            {t('requests.popup.markViewed')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MessageDetailsPopup;
