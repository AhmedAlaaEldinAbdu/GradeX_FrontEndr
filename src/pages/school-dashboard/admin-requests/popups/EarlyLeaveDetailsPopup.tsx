import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import UserAvatarName from '@/shared/components/UserAvatarName';
import ExistingFileDisplay from '@/shared/components/ExistingFileDisplay';
import { useNavigate } from 'react-router-dom';
import type { EarlyLeaveRequestDto } from '@/services/api/types/teacher-requests.types';

interface EarlyLeaveDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  request: EarlyLeaveRequestDto | null;
}

const displayValue = (value: string | null | undefined) => value?.trim() || '--';

// Format time from HH:mm:ss to display format (HH:mm)
const formatTime = (timeString: string): string => {
  if (!timeString) return '--';
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
};

// Format duration from HH:mm:ss to readable format with translations
const formatDuration = (durationString: string, t: (key: string) => string): string => {
  if (!durationString) return '--';
  const [hours, minutes] = durationString.split(':');
  const hoursNum = parseInt(hours, 10);
  const minutesNum = parseInt(minutes, 10);

  let result = '';
  if (hoursNum > 0) {
    const hourLabel =
      hoursNum === 1
        ? t('adminRequests.earlyLeave.timeUnits.hour')
        : t('adminRequests.earlyLeave.timeUnits.hours');
    result += `${hoursNum} ${hourLabel}`;
  }
  if (minutesNum > 0) {
    if (result) result += ` ${t('adminRequests.earlyLeave.timeUnits.and')} `;
    const minuteLabel =
      minutesNum === 1
        ? t('adminRequests.earlyLeave.timeUnits.minute')
        : t('adminRequests.earlyLeave.timeUnits.minutes');
    result += `${minutesNum} ${minuteLabel}`;
  }
  return result || '--';
};

// Format date from ISO string to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  if (!dateString) return '--';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '--';
  }
};

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
    <span className="text-base font-semibold text-black-900">{label}:</span>
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
    1: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: t('adminRequests.earlyLeave.pending'),
    },
    2: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: t('adminRequests.earlyLeave.approved'),
    },
    3: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: t('adminRequests.earlyLeave.rejected'),
    },
  } as const;

  if (!request) return null;

  const statusKey = request.requestStatus as keyof typeof statusColors;
  const statusColor = statusColors[statusKey] || statusColors[1];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('adminRequests.earlyLeave.detailsTitle')}
      size="md"
    >
      <div className="space-y-6 px-2 pb-2">
        {/* Status */}
        <DetailRow label={t('adminRequests.earlyLeave.status')}>
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${statusColor.bg} ${statusColor.text}`}
          >
            {statusColor.label}
          </span>
        </DetailRow>

        {/* Applicant */}
        <DetailRow label={t('adminRequests.earlyLeave.applicant')}>
          <UserAvatarName
            name={displayValue(request.teacherName)}
            avatarSrc={undefined}
            onView={() => navigate('#!')}
          />
        </DetailRow>

        {/* Request Date */}
        <DetailRow label={t('adminRequests.earlyLeave.requestDate')}>
          <span className="text-sm font-normal text-[#646969]">{formatDate(request.date)}</span>
        </DetailRow>

        {/* Time */}
        <DetailRow label={t('adminRequests.earlyLeave.time')}>
          <span className="text-sm font-normal text-[#646969]">
            {formatTime(request.fromTime)} - {formatTime(request.toTime)}
          </span>
        </DetailRow>

        {/* Duration */}
        <DetailRow label={t('adminRequests.earlyLeave.earlyLeaveDuration')}>
          <span className="text-sm font-normal text-[#646969]">
            {formatDuration(request.duration, t)}
          </span>
        </DetailRow>

        {/* Reason */}
        <DetailRow label={t('adminRequests.earlyLeave.reason')}>
          <span className="text-sm font-normal text-[#646969]">{displayValue(request.reason)}</span>
        </DetailRow>

        {/* Attachments */}
        {request.attachments && request.attachments.length > 0 && (
          <div className="space-y-3">
            <span className="flex text-base font-semibold text-black-900">
              {t('adminRequests.earlyLeave.attachments')}:
            </span>
            {request.attachments.map((attachment) => (
              <ExistingFileDisplay
                key={attachment.id}
                filePath={attachment.filePath}
                fileName={attachment.fileName}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EarlyLeaveDetailsPopup;
