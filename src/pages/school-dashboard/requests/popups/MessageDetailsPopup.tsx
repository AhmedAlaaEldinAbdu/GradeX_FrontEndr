import PopupFooter from '@/shared/popups/PopupFooter';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import FilesGreenIcon from '@gradex/assets/icons/FilesGreen.svg';

import type { StudentRequestDto } from '@/services/api/requests/requests.types';
import {
  StudentRequestStatus,
  RequestParticipantRole,
} from '@/services/api/requests/requests.types';

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
  <div className="flex items-start gap-3">
    <span className="shrink-0 text-base font-semibold text-black-900">{label}:</span>
    <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
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
  onMarkViewed?: (request: StudentRequestDto) => Promise<void> | void;
  isMarkingViewed?: boolean;
  /** Translation key for the popup title (defaults to the message title). */
  titleKey?: string;
}

const MessageDetailsPopup: React.FC<MessageDetailsPopupProps> = ({
  isOpen,
  onClose,
  request,
  onMarkViewed,
  isMarkingViewed = false,
  titleKey = 'requests.popup.title',
}) => {
  const { t } = useTranslation();

  if (!request) {
    return null;
  }

  const canMarkViewed =
    request.recipientRole === RequestParticipantRole.School &&
    request.status === StudentRequestStatus.Pending &&
    request.isViewed !== true;

  return (
    <Modal
      placement="end"
      isOpen={isOpen}
      onClose={isMarkingViewed ? () => undefined : onClose}
      title={t(titleKey)}
      size="md"
    >
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

        {request.attachments && request.attachments.length > 0 ? (
          <div className="rounded-2xl border border-[#DDE0E0] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F4EE]">
                  <CustomImage src={FilesGreenIcon} alt="" className="h-5 w-5" />
                </span>
                <h3 className="truncate text-base font-semibold text-black-900">
                  {t('common.attachments')}
                </h3>
              </div>

              <span className="shrink-0 rounded-full bg-[#F2F7F5] px-3 py-1 text-xs font-medium text-green-500">
                {request.attachments.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {request.attachments.map((attachment) => (
                <ExistingFileDisplay
                  key={attachment.id || attachment.fileUrl}
                  filePath={attachment.fileUrl}
                  fileName={attachment.fileName}
                  showViewButton
                  showDownloadButton
                  className="mb-0! rounded-xl! border-[#EEF0F0]! bg-[#F8FAFA]! transition-colors hover:bg-[#F2F7F5]!"
                />
              ))}
            </div>
          </div>
        ) : null}

        {canMarkViewed ? (
          <PopupFooter className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isMarkingViewed}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              actionKey="markViewed"
              disabled={isMarkingViewed}
              onClick={async () => {
                try {
                  await onMarkViewed?.(request);
                  onClose();
                } catch {
                  // Keep the popup open; parent handlers own user feedback.
                }
              }}
            >
              {isMarkingViewed ? t('requests.popup.markingViewed') : t('requests.popup.markViewed')}
            </Button>
          </PopupFooter>
        ) : null}
      </div>
    </Modal>
  );
};

export default MessageDetailsPopup;
