import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Modal from '@/shared/popups/Modal';
import Loading from '@/shared/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  deleteMonthlyCalendarEvent,
  fetchMonthlyCalendarEvents,
} from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import type {
  MonthlyCalendarEvent,
  MonthlyEventEntity,
} from '@/services/api/types/monthly-calendar.types';
import { MonthlyCalendarDuration } from '@/shared/enums/enums';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';

interface MonthlyEventDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event: MonthlyEventEntity | null;
}

export default function MonthlyEventDetailsPopup({
  isOpen,
  onClose,
  event,
}: MonthlyEventDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { popupEvents, popupIsLoading } = useAppSelector((state) => state.monthlyCalendar);
  const isRTL = i18n.language === 'ar';
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { showToast } = useToast();

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [eventIdPendingDelete, setEventIdPendingDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = useMemo(() => {
    const day = event?.day;
    if (!day) {
      return '';
    }

    const parsed = new Date(`${day}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return day;
    }

    return format(parsed, 'PPP', {
      locale: i18n.language === 'ar' ? ar : undefined,
    });
  }, [event?.day, i18n.language]);

  useEffect(() => {
    if (!isOpen) {
      setFetchError(null);
      setShowDeletePopup(false);
      setEventIdPendingDelete(null);
      return;
    }

    const day = event?.day;
    if (!day) {
      return;
    }

    setFetchError(null);

    dispatch(
      fetchMonthlyCalendarEvents({
        filters: { date: day },
        target: 'popup',
        page: 1,
        limit: 1000,
      })
    )
      .unwrap()
      .then((res) => {
        if (!res.data.length) {
          const message = t('common.noData');
          setFetchError(message);
          showToast({ message, type: 'error' });
        }
      })
      .catch((error) => {
        const message =
          typeof error === 'string' ? error : (error as { message?: string })?.message;
        const fallback = message ?? t('common.error');
        setFetchError(fallback);
        showToast({ message: fallback, type: 'error' });
      });
  }, [dispatch, event?.day, isOpen, t, showToast]);

  const handleRequestDelete = (id: string) => {
    setEventIdPendingDelete(id);
    setShowDeletePopup(true);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setEventIdPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventIdPendingDelete) {
      return;
    }

    const currentCount = popupEvents.length;
    const day = event?.day;

    try {
      setIsDeleting(true);
      await dispatch(deleteMonthlyCalendarEvent(eventIdPendingDelete)).unwrap();

      showToast({
        message: t('monthlyCalendar.messages.eventDeleted'),
        type: 'success',
      });

      setShowDeletePopup(false);
      setEventIdPendingDelete(null);

      // If this was the last item in the popup, close the modal.
      if (currentCount <= 1) {
        onClose();
        return;
      }

      if (day) {
        const res = await dispatch(
          fetchMonthlyCalendarEvents({
            filters: { date: day },
            target: 'popup',
            page: 1,
            limit: 1000,
          })
        ).unwrap();

        if (!res.data.length) {
          const message = t('common.noData');
          setFetchError(message);
          showToast({ message, type: 'error' });
        }
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : (error as { message?: string })?.message;

      showToast({
        message: message ?? t('common.error'),
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const mapApiEventToEntity = useCallback((apiEvent: MonthlyCalendarEvent): MonthlyEventEntity => {
    const day = apiEvent.day ? format(new Date(apiEvent.day), 'yyyy-MM-dd') : '';
    const startTime = apiEvent.startTime ? format(new Date(apiEvent.startTime), 'hh:mm') : '';
    const endTime = apiEvent.endTime ? format(new Date(apiEvent.endTime), 'hh:mm') : '';
    const duration = apiEvent.duration ?? MonthlyCalendarDuration.Day;

    return {
      id: apiEvent.id,
      nameAr: apiEvent.nameAr,
      nameEn: apiEvent.nameEn,
      grades: (apiEvent.grade ?? []).map((grade) => ({
        id: grade.id,
        nameAr: grade.nameAr,
        nameEn: grade.nameEn,
      })),
      classRomms: (apiEvent.class ?? []).map((classroom) => ({
        id: classroom.id,
        nameAr: classroom.nameAr,
        nameEn: classroom.nameEn,
      })),
      day,
      duration,
      isFullDay: duration === MonthlyCalendarDuration.Day,
      startTime,
      endTime,
      schoolBranchesId: apiEvent.schoolBranchesId,
    };
  }, []);

  const normalizedPopupEvents = useMemo<MonthlyEventEntity[]>(
    () => popupEvents.map(mapApiEventToEntity),
    [popupEvents, mapApiEventToEntity]
  );

  if (!event) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formattedDate || t('monthlyCalendar.details.title')}
      size="md"
      titleClassName="font-semibold"
    >
      <div dir={isRTL ? 'rtl' : 'ltr'} className="space-y-6">
        {popupIsLoading ? (
          <div className="py-8">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {normalizedPopupEvents.map((item) => {
              const localizedEventName = isRTL ? item.nameAr : item.nameEn || item.nameAr;

              const isFullDayEvent =
                item.duration === MonthlyCalendarDuration.Day || item.isFullDay === true;

              const durationLabel = isFullDayEvent
                ? t('monthlyCalendar.details.fullDay')
                : t('monthlyCalendar.details.customDuration');

              const stageLabels = item.grades.map((stage) =>
                isRTL
                  ? (stage.nameAr ?? stage.nameEn ?? stage.id)
                  : (stage.nameEn ?? stage.nameAr ?? stage.id)
              );
              const classroomLabels = item.classRomms.map((classroom) =>
                isRTL
                  ? (classroom.nameAr ?? classroom.nameEn ?? classroom.id)
                  : (classroom.nameEn ?? classroom.nameAr ?? classroom.id)
              );

              return (
                <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-right text-lg font-semibold text-gray-900">
                      {localizedEventName}
                    </h3>
                    {normalizedPopupEvents.length > 1 && (
                      <div className="flex items-center">
                        <IconButton
                          status="delete"
                          variant="danger"
                          onClick={() => handleRequestDelete(item.id)}
                          disabled={isDeleting}
                          ariaLabel="Delete"
                          title={t('actions.delete')}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {t('monthlyCalendar.details.eventNameAr')}:
                      </span>
                      <span className="text-gray-700 md:text-center">{item.nameAr || '-'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {t('monthlyCalendar.details.eventNameEn')}:
                      </span>
                      <span className="text-gray-700 md:text-center">{item.nameEn || '-'}</span>
                    </div>

                    {!isFullDayEvent && (
                      <div className="flex flex-col gap-2 md:flex-row">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">
                              {t('monthlyCalendar.details.startTime')}:
                            </span>
                            <span className="text-gray-700">{item.startTime ?? '--:--'}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">
                              {t('monthlyCalendar.details.endTime')}:
                            </span>
                            <span className="text-gray-700">{item.endTime ?? '--:--'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">
                        {t('monthlyCalendar.form.duration')}:
                      </span>
                      <span className="text-gray-700 md:text-center">{durationLabel}</span>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex-shrink-0 font-semibold text-gray-700">
                        {t('monthlyCalendar.details.stages')}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {stageLabels.length ? (
                          stageLabels.map((stage) => (
                            <span
                              key={stage}
                              className="text-md rounded-md bg-emerald-50 px-3 py-1 font-semibold text-emerald-700"
                            >
                              {stage}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="flex-shrink-0 font-semibold text-gray-700">
                        {t('monthlyCalendar.details.classrooms')}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {classroomLabels.length ? (
                          classroomLabels.map((classroom) => (
                            <span
                              key={classroom}
                              className="text-md rounded-md bg-emerald-50 px-3 py-1 font-semibold text-emerald-700"
                            >
                              {classroom}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>
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
        message="monthlyCalendar.actions.confirmDelete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </Modal>
  );
}
