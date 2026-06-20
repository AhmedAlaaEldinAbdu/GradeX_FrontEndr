import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';

interface ApplicationHeaderActionsProps {
  status: StudentApplicationStatus;
  hasInterview: boolean;
  isHoused?: boolean;
  onAccept: () => void;
  onNotPassed: () => void;
  onEditRequest: () => void;
  onSchedule: () => void;
  onHousing?: () => void;
}

const ApplicationHeaderActions: React.FC<ApplicationHeaderActionsProps> = ({
  status,
  hasInterview,
  isHoused,
  onAccept,
  onNotPassed,
  onEditRequest,
  onSchedule,
  onHousing,
}) => {
  const { t } = useTranslation();

  if (status === StudentApplicationStatus.Accept) {
    if (isHoused) return null;
    if (!onHousing) return null;
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="success" onClick={onHousing}>
          {t('studentApplications.actions.housing')}
        </Button>
      </div>
    );
  }

  if (status === StudentApplicationStatus.Reject) {
    return null;
  }

  const showDecisionOnlyActions =
    status === StudentApplicationStatus.EditRequest ||
    status === StudentApplicationStatus.Edited ||
    status === StudentApplicationStatus.InterviewScheduled ||
    hasInterview;

  if (showDecisionOnlyActions) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="success" onClick={onAccept}>
          {t('studentApplications.actions.accept')}
        </Button>

        <Button variant="danger" onClick={onNotPassed}>
          {t('studentApplications.actions.notPassed')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="success" onClick={onAccept}>
        {t('studentApplications.actions.accept')}
      </Button>

      <Button variant="danger" onClick={onNotPassed}>
        {t('studentApplications.actions.notPassed')}
      </Button>

      <Button variant="info" onClick={onEditRequest}>
        {t('studentApplications.actions.sendEditRequest')}
      </Button>
      <Button variant="primary" onClick={onSchedule}>
        {t('studentApplications.actions.scheduleAppointment')}
      </Button>
    </div>
  );
};

export default ApplicationHeaderActions;
