import React from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import IconButton from '@/shared/components/IconButton';
import CustomImage from '@/shared/components/CustomImage';
import UserAvatarName from '@/shared/components/UserAvatarName';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import FileIcon from '@gradex/assets/icons/File.svg';
import DownloadIcon from '@gradex/assets/icons/Download.svg';
import FilesGreenIcon from '@gradex/assets/icons/FilesGreen.svg';
import ImageIcon from '@gradex/assets/icons/Image.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';

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

const resolveAttachmentUrl = (fileUrl: string) => {
  if (fileUrl.startsWith('http') || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) {
    return fileUrl;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const relativeUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${baseUrl}${relativeUrl}`;
};

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toUpperCase() || 'FILE';

const isImageAttachment = (fileName: string) =>
  ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(
    getFileExtension(fileName).toLowerCase()
  );

const getAttachmentIcon = (fileName: string) => {
  const extension = getFileExtension(fileName).toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
    return ImageIcon;
  }

  if (extension === 'pdf') {
    return PdfIcon;
  }

  return FileIcon;
};

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => (
  <div className="flex items-start gap-3">
    <span className="shrink-0 text-base font-semibold text-[#0E1F1F]">{label}:</span>
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
                <h3 className="truncate text-base font-semibold text-[#0E1F1F]">
                  {t('common.attachments')}
                </h3>
              </div>

              <span className="shrink-0 rounded-full bg-[#F2F7F5] px-3 py-1 text-xs font-medium text-[#00512E]">
                {request.attachments.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {request.attachments.map((attachment) => (
                <div
                  key={attachment.id || attachment.fileUrl}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#EEF0F0] bg-[#F8FAFA] px-3 py-3 transition-colors hover:bg-[#F2F7F5]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                      {isImageAttachment(attachment.fileName) ? (
                        <CustomImage
                          src={resolveAttachmentUrl(attachment.fileUrl)}
                          fallbackSrc={ImageIcon}
                          alt={attachment.fileName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CustomImage
                          src={getAttachmentIcon(attachment.fileName)}
                          alt=""
                          className="h-5 w-5"
                        />
                      )}
                    </span>
                    <div className="min-w-0 flex-1 text-start">
                      <p className="truncate text-sm font-medium text-[#0E1F1F]">
                        {attachment.fileName}
                      </p>
                      <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#646969]">
                        {getFileExtension(attachment.fileName)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={resolveAttachmentUrl(attachment.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDE0E0] bg-white transition-colors hover:border-blue-200 hover:bg-blue-50"
                      title={t('common.view')}
                      aria-label={t('common.view')}
                    >
                      <CustomImage src={EyeStyledIcon} alt="" className="h-5 w-5" />
                    </a>
                    <a
                      href={resolveAttachmentUrl(attachment.fileUrl)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#DDE0E0] bg-white transition-colors hover:border-green-200 hover:bg-[#E8F4EE]"
                      title={t('common.download')}
                      aria-label={t('common.download')}
                    >
                      <CustomImage src={DownloadIcon} alt="" className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {canMarkViewed ? (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isMarkingViewed}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
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
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default MessageDetailsPopup;
