import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';

interface ApplicationHeaderActionsProps {
  status: StudentApplicationStatus;
  hasInterview: boolean;
  onAccept: () => void;
  onNotPassed: () => void;
  onEditRequest: () => void;
  onSchedule: () => void;
  onHousing?: () => void;
}

const ApplicationHeaderActions: React.FC<ApplicationHeaderActionsProps> = ({
  status,
  hasInterview,
  onAccept,
  onNotPassed,
  onEditRequest,
  onSchedule,
  onHousing,
}) => {
  const { t } = useTranslation();

  // Completed → only "onHousing" (Housing) button
  if (status === StudentApplicationStatus.Accept) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="success" onClick={onHousing}>
          {t('studentApplications.actions.housing')}
        </Button>
      </div>
    );
  }

  // Not Passed → no actions
  if (status === StudentApplicationStatus.Reject) {
    return null;
  }

  // For other active statuses, show appropriate buttons
  const showAllActions =
    status !== StudentApplicationStatus.Edited &&
    status !== StudentApplicationStatus.EditRequest &&
    !hasInterview;

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="success" onClick={onAccept}>
        {t('studentApplications.actions.accept')}
      </Button>

      <Button variant="danger" onClick={onNotPassed}>
        {t('studentApplications.actions.notPassed')}
      </Button>

      {showAllActions && (
        <>
          <Button variant="info" onClick={onEditRequest}>
            {t('studentApplications.actions.sendEditRequest')}
          </Button>
          <Button variant="primary" onClick={onSchedule}>
            {t('studentApplications.actions.scheduleAppointment')}
          </Button>
        </>
      )}
    </div>
  );
};

export default ApplicationHeaderActions;
