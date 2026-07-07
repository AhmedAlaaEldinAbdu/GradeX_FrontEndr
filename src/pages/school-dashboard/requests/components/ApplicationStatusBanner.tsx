import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StudentApplicationStatus } from '@/services/api/student-applications/student-applications.types';

interface ApplicationStatusBannerProps {
  status: StudentApplicationStatus;
  interviewDate?: string | null;
  editRequest?: string | null;
}

const ApplicationStatusBanner: React.FC<ApplicationStatusBannerProps> = ({
  status,
  interviewDate,
  editRequest,
}) => {
  const { t } = useTranslation();
  const [showBorder] = useState(false);

  const editRequestTooltip =
    status === StudentApplicationStatus.EditRequest && editRequest?.trim()
      ? editRequest.trim()
      : null;

  // Check if this is the "appointment scheduled" case (default with interviewDate)
  const isAppointmentScheduled =
    status !== StudentApplicationStatus.Edited &&
    status !== StudentApplicationStatus.EditRequest &&
    status !== StudentApplicationStatus.Reject &&
    status !== StudentApplicationStatus.Pending &&
    status !== StudentApplicationStatus.Accept &&
    status !== StudentApplicationStatus.Cancelled &&
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
      case StudentApplicationStatus.Cancelled:
        return {
          text: t('studentApplications.status.cancelled'),
          badgeClassName: 'bg-gray-100 text-gray-700 border border-gray-200',
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
      case StudentApplicationStatus.Cancelled:
        return `${base} border-s-gray-400`;
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
        {editRequestTooltip ? (
          <span className="group relative inline-flex">
            <span
              className={`inline-flex cursor-help items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${content.badgeClassName}`}
            >
              {content.text}
              <svg
                className="h-3.5 w-3.5 opacity-70"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute end-0 top-full z-10 mt-2 hidden w-64 whitespace-pre-wrap rounded-lg bg-gray-900 px-3 py-2 text-start text-xs font-normal leading-relaxed text-white shadow-lg group-hover:block"
            >
              {editRequestTooltip}
            </span>
          </span>
        ) : (
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium ${content.badgeClassName}`}
          >
            {content.text}
          </span>
        )}
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
