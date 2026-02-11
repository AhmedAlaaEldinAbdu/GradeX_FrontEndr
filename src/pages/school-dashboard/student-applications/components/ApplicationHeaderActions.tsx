import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';

interface ApplicationHeaderActionsProps {
  onAccept: () => void;
  onNotPassed: () => void;
  onEditRequest: () => void;
  onSchedule: () => void;
}

const ApplicationHeaderActions: React.FC<ApplicationHeaderActionsProps> = ({
  onAccept,
  onNotPassed,
  onEditRequest,
  onSchedule,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="primary" onClick={onAccept}>
        {t('studentApplications.actions.accept')}
      </Button>
      <Button variant="danger" onClick={onNotPassed}>
        {t('studentApplications.actions.notPassed')}
      </Button>
      <Button variant="info" onClick={onEditRequest}>
        {t('studentApplications.actions.sendEditRequest')}
      </Button>
      <Button variant="success" onClick={onSchedule}>
        {t('studentApplications.actions.scheduleAppointment')}
      </Button>
    </div>
  );
};

export default ApplicationHeaderActions;
