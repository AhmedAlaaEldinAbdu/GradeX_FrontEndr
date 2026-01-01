import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import ArrowIcon from '@gradex/assets/icons/Arrow.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchInterviews, deleteInterview } from '@/redux/features/interviews/interviewsSlice';
import type { InterviewFilters } from '@/redux/features/interviews/interviewsSlice';
import type { Interview } from '@/services/api/types/interviews.types';
import Loading from '@/shared/components/Loading';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface InterviewDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  interview: {
    id: string;
    title: string;
    start: Date;
    end: Date;
    candidateName?: string;
    position?: string;
    supervisor?: string;
  } | null;
}

export default function InterviewDetailsPopup({
  isOpen,
  onClose,
  interview,
}: InterviewDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { popupInterviews, popupIsLoading } = useAppSelector((state) => state.interviews);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [interviewIdPendingDelete, setInterviewIdPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const safeParseDate = (value?: Date | string | null) => {
    if (!value) return null;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const normalizeDatePortion = (value?: string) => {
    if (!value) return undefined;
    return value.includes('T') ? (value.split('T')[0] ?? undefined) : value;
  };

  const normalizeTimePortion = (value: string) => {
    if (value.includes('T')) return value;
    return value.length === 5 ? `${value}:00` : value;
  };

  const interviewId = interview?.id ?? null;
  const startDateForFilter = safeParseDate(interview?.start ?? null);
  const dateFilter = startDateForFilter ? format(startDateForFilter, 'yyyy-MM-dd') : undefined;

  useEffect(() => {
    if (!isOpen) {
      setSelectedInterview(null);
      setFetchError(null);
      return;
    }

    if (!interviewId || !dateFilter) {
      if (interviewId) {
        setFetchError(t('common.error'));
      }
      return;
    }

    const filters: InterviewFilters & { Date?: string } = {
      date: dateFilter,
    };

    setFetchError(null);
    setSelectedInterview(null);

    dispatch(
      fetchInterviews({
        filters,
        target: 'popup',
      })
    )
      .unwrap()
      .then((response) => {
        const foundInterview = response.data.find((item) => item.id === interviewId) ?? null;
        setSelectedInterview(foundInterview);

        if (!foundInterview) {
          setFetchError(t('interviews.interviewNotFound'));
        }
      })
      .catch((error) => {
        const fallback =
          typeof error === 'string' ? error : (error as { message?: string })?.message;
        setFetchError(fallback ?? t('common.error'));
      });
  }, [dateFilter, dispatch, interviewId, isOpen, t]);

  const toDateFromStrings = (dateStr?: string, timeStr?: string) => {
    if (timeStr?.includes('T')) {
      return safeParseDate(timeStr);
    }

    const normalizedDate = normalizeDatePortion(dateStr);

    if (dateStr?.includes('T') && !timeStr) {
      return safeParseDate(dateStr);
    }

    if (!normalizedDate || !timeStr) {
      return null;
    }

    return safeParseDate(`${normalizedDate}T${normalizeTimePortion(timeStr)}`);
  };

  const resolvedInterview = selectedInterview;

  const startDate = useMemo(() => {
    if (resolvedInterview) {
      return (
        toDateFromStrings(resolvedInterview.interviewDate, resolvedInterview.startTime) ??
        interview?.start ??
        null
      );
    }
    return interview?.start ?? null;
  }, [interview, resolvedInterview]);

  const formattedDate = startDate
    ? format(startDate, 'PPP', { locale: isRTL ? ar : undefined })
    : t('common.notAvailable');

  const formatTimeFromString = (time?: string) => {
    if (!time) return t('common.notAvailable');
    const candidate = time.includes('T') ? time : `1970-01-01T${normalizeTimePortion(time)}`;
    const parsed = safeParseDate(candidate);
    if (!parsed) {
      return t('common.notAvailable');
    }
    return format(parsed, 'p', { locale: isRTL ? ar : undefined });
  };

  const isDetailsLoading = popupIsLoading && !resolvedInterview;

  const handleRequestDelete = (interviewId: string) => {
    setInterviewIdPendingDelete(interviewId);
    setShowDeletePopup(true);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setInterviewIdPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!interviewIdPendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await dispatch(deleteInterview(interviewIdPendingDelete))
        .unwrap()
        .then((res: any) => {
          debugger;
          if (res === interviewIdPendingDelete || res.isSuccess) {
            setInterviewIdPendingDelete(null);
            setShowDeletePopup(false);
            showToast({
              message: t('interviews.interviewDeletedSuccessfully'),
              type: 'success',
            });
            if (dateFilter) {
              const filters: InterviewFilters & { Date?: string } = {
                date: dateFilter,
              };
              dispatch(
                fetchInterviews({
                  filters,
                  target: 'popup',
                })
              );
            }
          } else {
            setInterviewIdPendingDelete(null);
            setShowDeletePopup(false);
            showToast({
              message: t('common.error'),
              type: 'error',
            });
          }
        });
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');
      showToast({
        message,
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!interview) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formattedDate}>
      <div className="space-y-4 py-4">
        {isDetailsLoading ? (
          <Loading size="lg" />
        ) : (
          <div className="flex flex-col gap-4">
            {popupInterviews.map((detail) => {
              const jobTitle =
                detail.jobAdvertisementName ||
                detail.jobAdvertisementTitle ||
                t('common.notAvailable');

              return (
                <div key={detail.id} className="flex flex-col gap-3 rounded-lg border p-3">
                  <div className="flex justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {t('interviews.announcementName')}
                      </p>
                      <p className="text-gray-700">{jobTitle}</p>
                      <IconButton variant="default">
                        <CustomImage src={ArrowIcon} alt="arrow" className="h-5 w-5" />
                      </IconButton>
                    </div>
                    {popupInterviews?.length > 1 && (
                      <div className="flex items-center">
                        <IconButton
                          status="delete"
                          variant="danger"
                          onClick={() => handleRequestDelete(detail.id)}
                          disabled={isDeleting}
                          ariaLabel="Delete"
                          title={t('actions.delete')}
                        />
                      </div>
                    )}
                  </div>

                  {detail?.teacherName && (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{t('interviews.teacherName')}</p>:
                      <p>{detail.teacherName}</p>
                      <IconButton
                        variant="primary"
                        onClick={() =>
                          navigate(`teachers/${detail.teacherId}`, {
                            state: { from: 'interviews' },
                          })
                        }
                        ariaLabel="View Teacher"
                        title={t('teachers.ViewTeacherDetails')}
                      >
                        <CustomImage src={EyeStyledIcon} alt="supervisor" className="h-5 w-5" />
                      </IconButton>
                    </div>
                  )}

                  {detail?.supervisorName && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{t('interviews.supervisor')}</p>:
                        <p>{detail.supervisorName}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{t('interviews.startTime')}</p>:
                      <p>{formatTimeFromString(detail.startTime)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{t('interviews.endTime')}</p>:
                      <p>{formatTimeFromString(detail.endTime)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {fetchError && <p className="text-sm text-red-500">{fetchError}</p>}
          </div>
        )}
      </div>
      <DeletePopup
        open={showDeletePopup}
        message="interviews.confirmDeleteInterview"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </Modal>
  );
}
