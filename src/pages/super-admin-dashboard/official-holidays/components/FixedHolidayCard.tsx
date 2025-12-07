import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import type { FixedHoliday } from '@/types/officialHolidays';
import CheckIcon from '@gradex/assets/icons/Check.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import EyeIcon from '@gradex/assets/icons/Eye.svg';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { ActionsDropdown, type Action } from '@/shared/components/components';
import {
  deleteHoliday,
  fetchOfficialHolidays,
  selectIsDeleting,
} from '@/redux/features/official-holidays';
import { useToast } from '@/shared/context/ToastContext';
import AttachmentViewerPopup from '../popups/AttachmentViewerPopup';

interface FixedHolidayCardProps {
  holiday: FixedHoliday;
}

export default function FixedHolidayCard({ holiday }: FixedHolidayCardProps) {
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
    <>
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-green-300">
        <div className="flex w-full items-center gap-3 text-start">
          <div className="flex w-full flex-col gap-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <img src={CheckIcon} alt="Check" className="h-5 w-5" />
                <div className="flex gap-1 text-sm font-medium text-gray-800">
                  <span>{t('officialHolidays.dayShort')}:</span>
                  <span>{holiday.dayName}</span>
                </div>
              </div>
              <ActionsDropdown actions={actions} />
            </div>
            <div>
              <div className="flex gap-1">
                <span className="font-semibold text-gray-800">{t('officialHolidays.reason')}:</span>
                <span className="text-gray-600">{holiday.reason}</span>
              </div>
            </div>
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
    </>
  );
}
