import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import UserAvatarName from '@/shared/components/UserAvatarName';
import Modal from '@/shared/popups/Modal';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';

import {
  AdminTeacherNoteStatus,
  type AdminTeacherNoteDto,
  type AdminTeacherNoteParty,
} from '../admin-requests.types';

const STATUS_BADGE_CLASSES: Record<AdminTeacherNoteStatus, string> = {
  [AdminTeacherNoteStatus.Pending]: 'bg-orange-100 text-orange-700',
  [AdminTeacherNoteStatus.Viewed]: 'bg-green-100 text-green-700',
};

const STATUS_LABEL_KEYS: Record<AdminTeacherNoteStatus, string> = {
  [AdminTeacherNoteStatus.Pending]: 'adminRequests.teacherNotes.status.pending',
  [AdminTeacherNoteStatus.Viewed]: 'adminRequests.teacherNotes.status.viewed',
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '--';
  }

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const displayValue = (value: string | null | undefined) => value?.trim() || '--';

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, children }) => (
  <div className="flex items-center gap-3">
    <span className="text-base font-semibold text-black-900">{label}:</span>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

const EyeBadge: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <IconButton variant="blue" ariaLabel={label} className="h-9 w-9" onClick={onClick}>
    <CustomImage src={EyeStyledIcon} alt={label} className="h-5 w-5" />
  </IconButton>
);

const PartyValue: React.FC<{
  party: AdminTeacherNoteParty;
  eyeLabel: string;
  onProfilePreview: () => void;
}> = ({ party, eyeLabel, onProfilePreview }) => {
  if (party.isSchool) {
    return <span className="text-sm font-normal text-[#646969]">{displayValue(party.name)}</span>;
  }

  return (
    <>
      <UserAvatarName name={displayValue(party.name)} avatarSrc={party.avatarPath} align="center" />
      <EyeBadge label={eyeLabel} onClick={onProfilePreview} />
    </>
  );
};

export interface TeacherNoteDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  note: AdminTeacherNoteDto | null;
  onMarkViewed: (note: AdminTeacherNoteDto) => Promise<void> | void;
  isMarkingViewed?: boolean;
  onProfilePreview: () => void;
}

const TeacherNoteDetailsPopup: React.FC<TeacherNoteDetailsPopupProps> = ({
  isOpen,
  onClose,
  note,
  onMarkViewed,
  isMarkingViewed = false,
  onProfilePreview,
}) => {
  const { t } = useTranslation();

  if (!note) {
    return null;
  }

  const canMarkViewed = note.status === AdminTeacherNoteStatus.Pending && note.isViewed !== true;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isMarkingViewed ? () => undefined : onClose}
      title={t('adminRequests.teacherNotes.detailsTitle')}
      size="md"
    >
      <div className="space-y-6">
        <DetailRow label={t('adminRequests.teacherNotes.columns.status')}>
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${STATUS_BADGE_CLASSES[note.status]}`}
          >
            {t(STATUS_LABEL_KEYS[note.status])}
          </span>
        </DetailRow>

        <DetailRow label={t('adminRequests.teacherNotes.columns.sentFrom')}>
          <PartyValue
            party={note.sender}
            eyeLabel={t('common.view')}
            onProfilePreview={onProfilePreview}
          />
        </DetailRow>

        <DetailRow label={t('adminRequests.teacherNotes.columns.sentTo')}>
          <PartyValue
            party={note.recipient}
            eyeLabel={t('common.view')}
            onProfilePreview={onProfilePreview}
          />
        </DetailRow>

        <DetailRow label={t('adminRequests.teacherNotes.columns.stage')}>
          <span className="text-sm font-normal text-[#646969]">{displayValue(note.stage)}</span>
        </DetailRow>

        <DetailRow label={t('adminRequests.teacherNotes.columns.classroom')}>
          <span className="text-sm font-normal text-[#646969]">{displayValue(note.classroom)}</span>
        </DetailRow>

        <DetailRow label={t('adminRequests.teacherNotes.columns.sentDate')}>
          <span className="text-sm font-normal text-[#646969]">{formatDate(note.sentDate)}</span>
        </DetailRow>

        <DetailRow label={t('adminRequests.teacherNotes.columns.content')}>
          <span className="text-sm font-normal text-[#646969]">
            {displayValue(note.noteContent)}
          </span>
        </DetailRow>

        {canMarkViewed ? (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isMarkingViewed}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              actionKey="markViewed"
              disabled={isMarkingViewed}
              onClick={async () => {
                try {
                  await onMarkViewed(note);
                  onClose();
                } catch {
                  // Keep the popup open; parent handlers own user feedback.
                }
              }}
            >
              {isMarkingViewed
                ? t('adminRequests.teacherNotes.actions.markingViewed')
                : t('adminRequests.teacherNotes.actions.markViewed')}
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default TeacherNoteDetailsPopup;
