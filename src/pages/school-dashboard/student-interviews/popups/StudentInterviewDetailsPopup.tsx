import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useState } from 'react';

interface StudentInterviewDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  interview: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function StudentInterviewDetailsPopup({
  isOpen,
  onClose,
  interview,
  onEdit,
  onDelete,
}: StudentInterviewDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  if (!interview) return null;

  const formattedDate = interview.start
    ? format(new Date(interview.start), 'PPP', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const formatTime = (date?: Date) => {
    if (!date) return t('common.notAvailable');
    return format(new Date(date), 'p', { locale: isRTL ? ar : undefined });
  };

  const handleDelete = () => {
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    onDelete(interview.id);
    setShowDeletePopup(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-4 py-4">
        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <div className="flex justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{t('studentManagement.studentName')}:</p>
              <p className="text-gray-700">{interview.studentName}</p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                status="edit"
                variant="success"
                onClick={() => onEdit(interview.id)}
                ariaLabel="Edit"
                title={t('actions.edit')}
              />
              <IconButton
                status="delete"
                variant="danger"
                onClick={handleDelete}
                ariaLabel="Delete"
                title={t('actions.delete')}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">
              {t('registrationAnnouncement.educationalStage')}:
            </p>
            <p>{interview.educationalStage}</p>
          </div>

          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{t('interviews.supervisorName')}:</p>
            <p>{interview.supervisorName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{t('interviews.startTime')}:</p>
              <p>{formatTime(interview.start)}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{t('interviews.endTime')}:</p>
              <p>{formatTime(interview.end)}</p>
            </div>
          </div>
        </div>
      </div>
      <DeletePopup
        open={showDeletePopup}
        message="interviews.confirmDeleteInterview"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeletePopup(false)}
        iconSrc={BigTrashIcon}
      />
    </Modal>
  );
}
