import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ProfileImage from '@gradex/assets/images/profile.png';
import type { SchoolNotificationRecipient } from '@/services/api/types/school-notification.types';

const FILE_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

const resolveFileUrl = (path?: string | null) => {
  if (!path) return null;
  return /^https?:\/\//i.test(path) ? path : `${FILE_BASE_URL}/${path.replace(/^\/+/, '')}`;
};

type NotificationRecipientsPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  recipients: SchoolNotificationRecipient[];
  isRtl?: boolean;
  showViewAction?: boolean;
  viewLabel: string;
  onViewRecipient?: (recipient: SchoolNotificationRecipient) => void;
};

export default function NotificationRecipientsPopup({
  isOpen,
  onClose,
  title,
  recipients,
  isRtl = false,
  showViewAction = false,
  viewLabel,
  onViewRecipient,
}: NotificationRecipientsPopupProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex max-h-[60vh] flex-col divide-y divide-[#F1F1F1] overflow-y-auto">
        {recipients.map((recipient, index) => {
          const displayName = recipient.fullName?.trim() || '-';
          const canView = showViewAction && Boolean(recipient.id) && Boolean(onViewRecipient);

          return (
            <div
              key={recipient.id || `${recipient.fullName}-${index}`}
              className="flex items-center justify-between py-3"
            >
              <div
                dir={isRtl ? 'rtl' : 'ltr'}
                className="inline-flex w-full min-w-0 items-center gap-3"
              >
                <CustomImage
                  src={resolveFileUrl(recipient.imagePath) ?? ProfileImage}
                  fallbackSrc={ProfileImage}
                  alt={displayName}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <span
                  className="min-w-0 flex-1 truncate text-start text-sm font-normal text-[#646969]"
                  title={displayName}
                >
                  {displayName}
                </span>
                {canView && (
                  <IconButton
                    variant="blue"
                    ariaLabel={viewLabel}
                    className="h-10 w-10 shrink-0"
                    onClick={() => onViewRecipient?.(recipient)}
                  >
                    <CustomImage src={EyeStyledIcon} alt={viewLabel} className="h-6 w-6" />
                  </IconButton>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
