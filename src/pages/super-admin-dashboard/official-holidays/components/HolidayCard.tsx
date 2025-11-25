import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import type { OfficialHoliday } from '@/types/officialHolidays';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import EyeIcon from '@gradex/assets/icons/Eye.svg';
import DeletePopup from '@gradex/shared/components/DeletePopup';
import AttachmentViewerPopup from '../popups/AttachmentViewerPopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { ActionsDropdown, type Action } from '@/shared/components/components';
import {
  deleteHoliday,
  fetchOfficialHolidays,
  selectIsDeleting,
} from '@/redux/features/official-holidays';
import { useToast } from '@/shared/context/ToastContext';

interface HolidayCardProps {
  holiday: OfficialHoliday;
  index: number;
  isUpcomingHoliday: (dateString?: string) => boolean;
  showConnector: boolean;
}

export default function HolidayCard({
  holiday,
  index,
  isUpcomingHoliday,
  showConnector,
}: HolidayCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { countryId } = useParams<{ countryId: string }>();
  const { showToast } = useToast();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const isDeleting = useSelector(selectIsDeleting);

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteHoliday(holiday.id)).unwrap();
      setShowDeletePopup(false);

      showToast({
        message: t('officialHolidays.holidayDeletedSuccessfully'),
        type: 'success',
      });

      if (countryId) {
        dispatch(
          fetchOfficialHolidays({
            page: 1,
            limit: 100,
            filters: {
              countryId,
            },
          })
        );
      }
    } catch (error) {
      console.error('Failed to delete holiday:', error);
      showToast({
        message: t('common.error'),
        type: 'error',
      });
    }
  };

  const actions: Action[] = [
    ...(holiday.hasOfficialDocument
      ? [
          {
            id: 'view-attachment',
            label: t('actions.viewAttachment'),
            icon: EyeIcon,
            color: 'text-blue-600 hover:bg-blue-50',
            onClick: () => {
              setShowAttachmentPopup(true);
            },
          } as Action,
        ]
      : []),
    {
      id: 'edit',
      label: t('actions.edit'),
      icon: EditFilledIcon,
      color: 'text-gray-700 hover:bg-gray-100',
      onClick: () => navigate(`/official-holidays/edit-holiday/${holiday.id}`),
    },
    {
      id: 'delete',
      label: t('actions.delete'),
      icon: TrashIcon,
      color: 'text-red-600 hover:bg-red-50',
      onClick: () => {
        setShowDeletePopup(true);
      },
      disabled: isDeleting,
    },
  ];

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Number Circle with Connector Line */}
        <div className="relative flex flex-col items-center">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
              !isUpcomingHoliday(holiday.date)
                ? 'bg-green-600 text-white'
                : 'border border-gray-300 bg-white text-gray-500'
            }`}
          >
            {!isUpcomingHoliday(holiday.date) ? (
              <img
                src={CheckIcon}
                alt="Completed"
                className="h-3 w-3 brightness-200 invert saturate-0 filter"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              index
            )}
          </div>
          {/* Connector line to next circle */}
          {showConnector && (
            <div
              className={`mt-2 w-[2px] flex-1 ${
                !isUpcomingHoliday(holiday.date) ? 'bg-green-600' : 'bg-gray-200'
              }`}
              style={{ height: 'calc(100% + 1rem)', width: '2px' }}
            ></div>
          )}
        </div>

        {/* Holiday Card */}
        <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
          {/* Card Content */}
          <div className="flex justify-between">
            <div className="space-y-3">
              {/* Top Row: Date */}
              <div className="flex items-center justify-between">
                {/* Date with Calendar Icon */}
                <div className="flex items-center gap-1 text-sm text-gray-800">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-gray-400"
                  >
                    <rect
                      x="2"
                      y="3"
                      width="12"
                      height="11"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M2 6H14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 1.5V4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 1.5V4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="me-2 font-semibold">{t('officialHolidays.date')}:</span>

                  <span className="font-medium text-gray-700">{holiday.dateRange}</span>
                </div>
              </div>

              {/* Holiday Reason */}
              <p className="text-start text-sm text-gray-800">
                <span className="me-2 font-semibold">{t('officialHolidays.reason')}:</span>
                <span className="text-gray-700">{holiday.reason}</span>
              </p>
            </div>

            {/* Actions Dropdown */}
            <ActionsDropdown actions={actions} />
          </div>
        </div>
      </div>
      {/* Popups */}
      <DeletePopup
        open={showDeletePopup}
        message={t('officialHolidays.confirmDeleteHoliday')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeletePopup(false)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />

      {holiday.filePath && (
        <AttachmentViewerPopup
          open={showAttachmentPopup}
          filePath={holiday.filePath}
          fileName={holiday.filePath.split('/').pop()}
          onClose={() => setShowAttachmentPopup(false)}
        />
      )}
    </div>
  );
}
