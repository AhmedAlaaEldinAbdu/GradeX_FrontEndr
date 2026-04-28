import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';

interface ApplicationStatusBannerProps {
  status: StudentApplicationStatus;
  interviewDate?: string | null;
}

const ApplicationStatusBanner: React.FC<ApplicationStatusBannerProps> = ({
  status,
  interviewDate,
}) => {
  const { t } = useTranslation();
  const [showBorder] = useState(false);

  // Check if this is the "appointment scheduled" case (default with interviewDate)
  const isAppointmentScheduled =
    status !== StudentApplicationStatus.Edited &&
    status !== StudentApplicationStatus.EditRequest &&
    status !== StudentApplicationStatus.Reject &&
    status !== StudentApplicationStatus.Pending &&
    status !== StudentApplicationStatus.Accept &&
    !!interviewDate;

  const getBadgeContent = () => {
    switch (status) {
      case StudentApplicationStatus.Edited:
        return {
          text: t('studentApplications.status.modified'),
          badgeClassName: 'bg-purple-100 text-purple-700 border border-purple-200',
        };
      case StudentApplicationStatus.EditRequest:
        return {
          text: t('studentApplications.status.editRequested'),
          badgeClassName: 'bg-blue-50 text-blue-600 border border-blue-200',
        };
      case StudentApplicationStatus.Reject:
        return {
          text: t('studentApplications.status.notPassed'),
          badgeClassName: 'bg-red-100 text-red-700 border border-red-200',
        };
      case StudentApplicationStatus.Pending:
        return {
          text: t('studentApplications.status.underReview'),
          badgeClassName: 'bg-orange-100 text-orange-700 border border-orange-200',
        };
      case StudentApplicationStatus.Accept:
        return {
          text: t('studentApplications.status.completed'),
          badgeClassName: 'bg-green-100 text-green-700 border border-green-200',
        };
      default:
        if (interviewDate) {
          return {
            text: t('studentApplications.status.appointmentScheduled'),
            badgeClassName: 'bg-green-100 text-green-700 border border-green-200',
          };
        }
        return null;
    }
  };

  const content = getBadgeContent();
  if (!content) return null;

  // Determine accent border color for the card
  const getAccentColor = () => {
    if (!showBorder) {
      return '';
    }
    const base = 'border-s-4';
    switch (status) {
      case StudentApplicationStatus.Edited:
        return `${base} border-s-purple-400`;
      case StudentApplicationStatus.EditRequest:
        return `${base} border-s-blue-400`;
      case StudentApplicationStatus.Reject:
        return `${base} border-s-red-400`;
      case StudentApplicationStatus.Pending:
        return `${base} border-s-orange-400`;
      case StudentApplicationStatus.Accept:
        return `${base} border-s-green-400`;
      default:
        return `${base} border-s-green-400`;
    }
  };

  return (
    <div className={`mb-8 rounded-2xl border border-gray-200 ${getAccentColor()} p-5`}>
      {/* Row: Title on start side, Badge on end side */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {t('studentApplications.details.studentEvaluation')}
        </h2>
        <span
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${content.badgeClassName}`}
        >
          {content.text}
        </span>
      </div>

      {/* Appointment date row — ONLY for "تحديد موعد" (appointment scheduled) status */}
      {isAppointmentScheduled && interviewDate && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-bold text-gray-800">
            {t('studentApplications.details.appointmentDateLabel')}:
          </span>
          <span>
            {new Date(interviewDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusBanner;
