import React from 'react';
import { useTranslation } from 'react-i18next';

import Modal from '@/shared/popups/Modal';
import UserAvatarName from '@/shared/components/UserAvatarName';
import DefaultAvatar from '@gradex/assets/images/profile.png';

import type { RequestParticipant } from '@/services/api/requests/requests.types';
import { RequestParticipantRole } from '@/services/api/requests/requests.types';

interface ParticipantsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  participants: RequestParticipant[];
  onViewParticipant: (participant: RequestParticipant) => void;
}

const ParticipantsPopup: React.FC<ParticipantsPopupProps> = ({
  isOpen,
  onClose,
  title,
  participants,
  onViewParticipant,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex max-h-[60vh] flex-col divide-y divide-[#F1F1F1] overflow-y-auto">
        {participants.map((participant, index) => {
          const canView = participant.role !== RequestParticipantRole.School && participant.id;
          return (
            <div
              key={participant.id ?? `${participant.name}-${index}`}
              className="flex items-center justify-between py-3"
            >
              <UserAvatarName
                name={participant.name}
                avatarSrc={participant.avatarPath || DefaultAvatar}
                fallbackSrc={DefaultAvatar}
                align="start"
                viewLabel={t('common.view')}
                onView={canView ? () => onViewParticipant(participant) : undefined}
              />
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default ParticipantsPopup;
