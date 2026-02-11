import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import Loading from '@/shared/components/Loading';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  deleteStudentInterview,
  fetchStudentInterviews,
} from '@/redux/features/student-interviews/studentInterviewsSlice';
import type { StudentInterview } from '@/services/api/types/student-interviews.types';

interface StudentInterviewDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  interview: { id: string; start: Date } | null;
  onEdit?: (id: string) => void;
}

export default function StudentInterviewDetailsPopup({
  isOpen,
  onClose,
  interview,
  onEdit,
}: StudentInterviewDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { showToast } = useToast();
  const dispatch = useAppDispatch();
  const { popupStudentInterviews, popupIsLoading } = useAppSelector(
    (state) => state.studentInterviews
  );
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!interview) return null;

  const dateFilter = useMemo(() => {
    if (!interview.start) return undefined;
    return format(new Date(interview.start), 'yyyy-MM-dd');
  }, [interview.start]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!dateFilter) {
      return;
    }

    dispatch(
      fetchStudentInterviews({
        filters: { date: dateFilter },
        target: 'popup',
        limit: 10000,
      })
    ).catch(() => {
      // errors handled by global error state/toast in caller
    });
  }, [dateFilter, dispatch, isOpen]);

  const formattedDate = interview.start
    ? format(new Date(interview.start), 'PPP', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const safeParseDate = (value?: string | Date | null) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeTimePortion = (value: string) => (value.length === 5 ? `${value}:00` : value);

  const formatTimeFromString = (value?: string) => {
    if (!value) return t('common.notAvailable');
    const candidate = value.includes('T') ? value : `1970-01-01T${normalizeTimePortion(value)}`;
    const parsed = safeParseDate(candidate);
    if (!parsed) return t('common.notAvailable');
    return format(parsed, 'p', { locale: isRTL ? ar : undefined });
  };

  const getLocalizedName = (item: StudentInterview) =>
    (isRTL ? item.nameAr : item.nameEn) || item.nameAr || item.nameEn || t('interviews.interview');

  const handleRequestDelete = (id: string) => {
    setPendingDeleteId(id);
    setShowDeletePopup(true);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setPendingDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) {
      return;
    }

    try {
      setIsDeleting(true);
      await dispatch(deleteStudentInterview(pendingDeleteId)).unwrap();
      showToast({
        message: t('interviews.interviewDeletedSuccessfully'),
        type: 'success',
      });

      if (dateFilter) {
        dispatch(
          fetchStudentInterviews({
            filters: { date: dateFilter },
            target: 'popup',
            limit: 10000,
          })
        );
      }
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');
      showToast({ message, type: 'error' });
    } finally {
      setIsDeleting(false);
      setShowDeletePopup(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-4 py-4">
        {popupIsLoading ? (
          <Loading size="lg" />
        ) : (
          <div className="space-y-4">
            {popupStudentInterviews.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3">
                <div className="flex justify-between gap-3">
                  <p className="font-semibold text-gray-900">{getLocalizedName(item)}</p>
                  <div className="flex items-center gap-2">
                    <IconButton
                      status="edit"
                      variant="success"
                      onClick={() => onEdit?.(item.id)}
                      ariaLabel="Edit"
                      title={t('actions.edit')}
                    />
                    <IconButton
                      status="delete"
                      variant="danger"
                      onClick={() => handleRequestDelete(item.id)}
                      ariaLabel="Delete"
                      title={t('actions.delete')}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {t('studentManagement.studentName')}:
                  </p>
                  <p className="text-gray-700">
                    {item.studentName || item.studentId || t('common.notAvailable')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{t('interviews.supervisorName')}:</p>
                  <p className="text-gray-700">
                    {item.supervisorName || item.supervisorId || t('common.notAvailable')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{t('interviews.startTime')}:</p>
                    <p>{formatTimeFromString(item.startTime)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{t('interviews.endTime')}:</p>
                    <p>{formatTimeFromString(item.endTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <DeletePopup
        open={showDeletePopup}
        message="interviews.confirmDeleteInterview"
        itemName={
          popupStudentInterviews.find((x) => x.id === pendingDeleteId)
            ? getLocalizedName(popupStudentInterviews.find((x) => x.id === pendingDeleteId)!)
            : ''
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </Modal>
  );
}
