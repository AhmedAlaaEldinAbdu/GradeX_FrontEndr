import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import UserAvatarName from '@/shared/components/UserAvatarName';
import Modal from '@/shared/popups/Modal';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import XmarkCircleGrayIcon from '@gradex/assets/icons/XmarkCircleGray.svg';

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
  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-start">
    <span className="text-base font-semibold text-[#0E1F1F]">{label}:</span>
    <div className="flex min-w-0 items-center gap-2 text-sm font-normal text-[#646969]">
      {children}
    </div>
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
    return <span>{displayValue(party.name)}</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatarName
        name={displayValue(party.name)}
        avatarSrc={party.avatarPath}
        align="center"
        className="min-w-0"
      />
      <EyeBadge label={eyeLabel} onClick={onProfilePreview} />
    </div>
  );
};

export interface TeacherNoteDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  note: AdminTeacherNoteDto | null;
  onMarkViewed: (note: AdminTeacherNoteDto) => void;
  onProfilePreview: () => void;
}

const TeacherNoteDetailsPopup: React.FC<TeacherNoteDetailsPopupProps> = ({
  isOpen,
  onClose,
  note,
  onMarkViewed,
  onProfilePreview,
}) => {
  const { t } = useTranslation();

  if (!note) {
    return null;
  }

  const canMarkViewed = note.status === AdminTeacherNoteStatus.Pending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      size="lg"
      contentClassName="p-0"
    >
      <div className="relative px-6 py-8 sm:px-12 sm:py-10">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DDE0E0] bg-white transition-colors hover:bg-gray-50 sm:left-12 sm:top-10"
        >
          <CustomImage src={XmarkCircleGrayIcon} alt="" className="h-8 w-8" />
        </button>

        <h2 className="text-center text-2xl font-semibold text-[#0E1F1F]">
          {t('adminRequests.teacherNotes.detailsTitle')}
        </h2>

        <div className="mx-auto mt-12 max-w-2xl space-y-8">
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
            <span>{displayValue(note.stage)}</span>
          </DetailRow>

          <DetailRow label={t('adminRequests.teacherNotes.columns.classroom')}>
            <span>{displayValue(note.classroom)}</span>
          </DetailRow>

          <DetailRow label={t('adminRequests.teacherNotes.columns.sentDate')}>
            <span>{formatDate(note.sentDate)}</span>
          </DetailRow>

          <DetailRow label={t('adminRequests.teacherNotes.columns.content')}>
            <span>{displayValue(note.noteContent)}</span>
          </DetailRow>
        </div>

        {canMarkViewed ? (
          <div className="mt-12 flex flex-wrap items-center justify-end gap-4">
            <Button
              variant="outline"
              size="md"
              className="min-w-[150px]"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="success"
              size="md"
              className="min-w-[210px]"
              onClick={() => {
                onMarkViewed(note);
                onClose();
              }}
            >
              {t('adminRequests.teacherNotes.actions.markViewed')}
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default TeacherNoteDetailsPopup;
