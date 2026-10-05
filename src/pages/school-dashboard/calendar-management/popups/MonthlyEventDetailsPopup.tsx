import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Modal from '@/shared/popups/Modal';
import Loading from '@/shared/components/Loading';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  deleteMonthlyCalendarEvent,
  fetchMonthlyCalendarEvents,
} from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import type {
  MonthlyCalendarEvent,
  MonthlyEventEntity,
} from '@/services/api/types/monthly-calendar.types';
import type { OfficialHoliday } from '@/services/api/types/official-holidays.types';
import { MonthlyCalendarDuration } from '@/shared/enums/enums';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import ClockGray14Icon from '@/assets/icons/ClockGray14.svg';
import PencilGreenIcon from '@/assets/icons/PencilGreen.svg';
import TrashRoseIcon from '@/assets/icons/TrashRose.svg';
import { useToast } from '@/shared/context/ToastContext';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import {
  TONE_STYLES,
  formatFullDate,
  formatTime,
  formatWeekday,
  fromDayKey,
  toneForId,
  type MonthlyItemTone,
} from '../components/MonthlyCalendarItems';

const NEUTRAL_CHIP = 'border-[#E2E8F0] bg-[#F8FAFC] text-[#1E293B]';

interface MonthlyEventDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  event: MonthlyEventEntity | null;
  date?: string;
  leaves?: OfficialHoliday[];
  onEdit?: (event: MonthlyEventEntity) => void;
  filterOptions?: any;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-start">
      <span className="text-xs leading-4 text-[#9D9D9D]">{label}</span>
      <span className="text-sm leading-5 font-medium text-[black]">{value || '-'}</span>
    </div>
  );
}

function ChipsRow({
  label,
  items,
  chipClassName,
}: {
  label: string;
  items: string[];
  chipClassName: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-start">
      <span className="text-xs leading-4 text-[#9D9D9D]">{label}</span>
      {items.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`rounded-md border px-2.5 py-1 text-xs leading-4 font-medium ${chipClassName}`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-sm leading-5 font-medium text-[black]">-</span>
      )}
    </div>
  );
}

function CardHeader({
  title,
  tone,
  children,
}: {
  title: string;
  tone: MonthlyItemTone;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`size-2.5 shrink-0 rounded-full ${TONE_STYLES[tone].dot}`} />
        <h3 className="truncate text-start text-sm leading-5 font-bold text-[black]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TimeLine({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs leading-4 text-[#9D9D9D]">
      <CustomImage src={ClockGray14Icon} alt="" className="shrink-0" />
      <span>{label}</span>
    </div>
  );
}

export default function MonthlyEventDetailsPopup({
  isOpen,
  onClose,
  event,
  date,
  leaves,
  onEdit,
  filterOptions,
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

  const dayKey = event?.day ?? date ?? '';
  const hasLeaves = Boolean(leaves && leaves.length > 0);

  const dateSubtitle = useMemo(() => {
    if (!dayKey) {
      return '';
    }

    const parsed = fromDayKey(dayKey);
    if (Number.isNaN(parsed.getTime())) {
      return dayKey;
    }

    return `${formatWeekday(parsed, i18n.language)}${isRTL ? '، ' : ', '}${formatFullDate(parsed, i18n.language)}`;
  }, [dayKey, i18n.language, isRTL]);

  useEffect(() => {
    if (!isOpen) {
      setFetchError(null);
      setShowDeletePopup(false);
      setEventIdPendingDelete(null);
      return;
    }

    if (!dayKey) {
      return;
    }

    setFetchError(null);

    dispatch(
      fetchMonthlyCalendarEvents({
        filters: { date: dayKey, schoolBranchId: getCurrentSchoolBranchId(), ...filterOptions },
        target: 'popup',
      })
    )
      .unwrap()
      .then((res) => {
        if (!res.data.length && !hasLeaves) {
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
  }, [dispatch, dayKey, hasLeaves, isOpen, t, showToast]);

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
            filters: { date: day, schoolBranchId: getCurrentSchoolBranchId() },
            target: 'popup',
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
    const startTime = apiEvent.startTime ? format(new Date(apiEvent.startTime), 'HH:mm') : '';
    const endTime = apiEvent.endTime ? format(new Date(apiEvent.endTime), 'HH:mm') : '';
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

  const eventNamePendingDelete = useMemo(() => {
    if (!eventIdPendingDelete) return '';
    const target = normalizedPopupEvents.find((item) => item.id === eventIdPendingDelete);
    if (!target) return '';
    return isRTL ? target.nameAr : target.nameEn || target.nameAr;
  }, [eventIdPendingDelete, isRTL, normalizedPopupEvents]);

  if (!event && !date) {
    return null;
  }

  const dayLeaves = leaves ?? [];
  const totalCards = normalizedPopupEvents.length + dayLeaves.length;

  const getCategoryLabel = (raw: string | undefined) => {
    const key = (raw || '').toString().toLowerCase();
    if (key === 'official') return t('monthlyCalendar.leaveDetails.categories.official');
    if (key === 'static') return t('monthlyCalendar.leaveDetails.categories.static');
    return raw || '-';
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        showHeader={false}
        placement="end"
        panelClassName="max-w-[650px]! rounded-e-none rounded-s-lg border border-[#E2E8F0]/90 shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
        contentClassName="flex min-h-0 flex-col overflow-hidden! p-0!"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
          <div className="flex flex-col gap-1 text-start">
            <h2 className="text-xl leading-7 font-bold text-[black]">
              {t('monthlyCalendar.details.title')}
            </h2>
            <p className="text-xs leading-4 text-[#9D9D9D]">{dateSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
          >
            <CustomImage src={CloseXGreenIcon} alt="" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-4 overflow-y-auto px-8 py-6">
          {popupIsLoading ? (
            <div className="py-8">
              <Loading size="lg" />
            </div>
          ) : (
            <>
              {dayLeaves.map((leave) => {
                const localizedReason = isRTL ? leave.reasonAr : leave.reasonEN || leave.reasonAr;
                const localizedCountry = isRTL
                  ? leave.countryNameAR || leave.countryNameEN
                  : leave.countryNameEN || leave.countryNameAR;

                return (
                  <div
                    key={`leave-${leave.id}`}
                    className="flex flex-col gap-2.5 rounded-lg border border-[#E2E8F0] bg-white p-[15px]"
                  >
                    <CardHeader title={localizedReason} tone="amber" />
                    <TimeLine label={t('monthlyCalendar.details.fullDay')} />

                    <div className="flex flex-col gap-3 border-t border-[#F1F5F9] pt-3">
                      <DetailRow
                        label={t('monthlyCalendar.leaveDetails.reasonAr')}
                        value={leave.reasonAr}
                      />
                      <DetailRow
                        label={t('monthlyCalendar.leaveDetails.reasonEn')}
                        value={leave.reasonEN}
                      />
                      <ChipsRow
                        label={t('monthlyCalendar.leaveDetails.category')}
                        items={[getCategoryLabel(leave.leaveCategory)]}
                        chipClassName={`${TONE_STYLES.amber.chip} ${TONE_STYLES.amber.label}`}
                      />
                      <DetailRow
                        label={t('monthlyCalendar.leaveDetails.country')}
                        value={localizedCountry}
                      />
                    </div>
                  </div>
                );
              })}

              {normalizedPopupEvents.map((item) => {
                const tone = TONE_STYLES[toneForId(item.id)];
                const localizedEventName = isRTL ? item.nameAr : item.nameEn || item.nameAr;

                const isFullDayEvent =
                  item.duration === MonthlyCalendarDuration.Day || item.isFullDay === true;

                const timeLabel = isFullDayEvent
                  ? t('monthlyCalendar.details.fullDay')
                  : `${item.startTime ? formatTime(item.startTime, i18n.language) : '--:--'} - ${
                      item.endTime ? formatTime(item.endTime, i18n.language) : '--:--'
                    }`;

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
                  <div
                    key={item.id}
                    className="flex flex-col gap-2.5 rounded-lg border border-[#E2E8F0] bg-white p-[15px]"
                  >
                    <CardHeader title={localizedEventName} tone={toneForId(item.id)}>
                      {totalCards > 1 && (
                        <div className="flex shrink-0 items-center gap-2">
                          <IconButton
                            actionKey="edit"
                            ariaLabel={t('actions.edit')}
                            title={t('actions.edit')}
                            onClick={() => onEdit?.(item)}
                            disabled={isDeleting}
                            className="size-8 rounded-lg! border border-[#1E7A52]/10 bg-[#F0FDF4]! p-[7px]! shadow-none! hover:bg-[#DCFCE7]!"
                          >
                            <CustomImage src={PencilGreenIcon} alt="" className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            actionKey="delete"
                            ariaLabel={t('actions.delete')}
                            title={t('actions.delete')}
                            onClick={() => handleRequestDelete(item.id)}
                            disabled={isDeleting}
                            className="size-8 rounded-lg! border border-[#FECDD3]/60 bg-[#FFF1F2]! p-[7px]! shadow-none! hover:bg-[#FFE4E6]!"
                          >
                            <CustomImage src={TrashRoseIcon} alt="" className="h-4 w-4" />
                          </IconButton>
                        </div>
                      )}
                    </CardHeader>
                    <TimeLine label={timeLabel} />

                    <div className="flex flex-col gap-3 border-t border-[#F1F5F9] pt-3">
                      <DetailRow
                        label={t('monthlyCalendar.details.eventNameAr')}
                        value={item.nameAr}
                      />
                      <DetailRow
                        label={t('monthlyCalendar.details.eventNameEn')}
                        value={item.nameEn}
                      />
                      <ChipsRow
                        label={t('monthlyCalendar.details.stages')}
                        items={stageLabels}
                        chipClassName={`${tone.chip} ${tone.label}`}
                      />
                      <ChipsRow
                        label={t('monthlyCalendar.details.classrooms')}
                        items={classroomLabels}
                        chipClassName={NEUTRAL_CHIP}
                      />
                    </div>
                  </div>
                );
              })}

              {fetchError && totalCards === 0 && (
                <p className="text-sm text-red-500">{fetchError}</p>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5">
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-lg border border-[#1E7A52] bg-white px-[25px] text-sm leading-5 font-medium text-[#1E7A52] transition-colors hover:bg-[#F0FDF4]"
          >
            {t('common.close')}
          </button>
        </div>
      </Modal>

      <DeletePopup
        open={showDeletePopup}
        message="monthlyCalendar.actions.confirmDelete"
        itemName={eventNamePendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
}
