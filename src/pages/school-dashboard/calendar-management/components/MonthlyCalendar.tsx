import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addMonths, format, isSameMonth, startOfMonth } from 'date-fns';
import type { CustomSelectOption } from '@/shared/components/CustomSelect';
import DeletePopup from '@/shared/popups/DeletePopup';
import AddEditMonthlyEventPopup from '../popups/AddEditMonthlyEventPopup';
import MonthlyEventDetailsPopup from '../popups/MonthlyEventDetailsPopup';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useToast } from '@/shared/context/ToastContext';
import { useSuccessPopup } from '@/hooks/useSuccessPopup';
import {
  createMonthlyCalendarEvent,
  deleteMonthlyCalendarEvent,
  fetchMonthlyCalendarDashboardEvents,
  updateMonthlyCalendarEvent,
  type FetchMonthlyCalendarDashboardPayload,
} from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import { fetchLeaveBySchoolBranch } from '@/redux/features/official-holidays/officialHolidaysSlice';
import type { OfficialHoliday } from '@/services/api/types/official-holidays.types';
import type {
  CreateMonthlyCalendarRequest,
  MonthlyCalendarEvent,
  MonthlyEventEntity,
} from '@/services/api/types/monthly-calendar.types';
import type { MonthlyEventFormValues } from '@/validations/monthly-calendar-validations';
import { getErrorMessage } from '@/lib/http';
import { MonthlyCalendarDuration } from '@/shared/enums/enums';
import MonthlyCalendarToolbar from './MonthlyCalendarToolbar';
import MonthlyCalendarGrid from './MonthlyCalendarGrid';
import MonthlyDayPanel from './MonthlyDayPanel';
import {
  formatDayRange,
  formatMonthYear,
  formatTime,
  MONTHLY_SEARCH_PARAM,
  MONTHLY_STAGE_PARAM,
  fromDayKey,
  getGridRange,
  printElement,
  toDayKey,
  toneForId,
  type MonthlyCalendarItem,
  type MonthlyTypeFilter,
} from './MonthlyCalendarItems';

const DEFAULT_CALENDAR_START = '08:00';
const DEFAULT_CALENDAR_END = '18:00';
const CLASSROOM_LOOKUP_LIMIT = 10000;
const EDUCATIONAL_STAGE_LOOKUP_LIMIT = 10000;
const MAX_LEAVE_DAYS = 366;
const PRINT_AREA_ID = 'monthly-calendar-print-area';

const normalizeTime = (time: string) => (time.length === 5 ? `${time}:00` : time);

const buildLocalIsoString = (date: string, time: string) => {
  if (!date) return '';
  const normalizedTime = time ? normalizeTime(time) : normalizeTime(DEFAULT_CALENDAR_START);
  // Keep local wall-clock time (no UTC conversion) to avoid timezone shifts in payload.
  return `${date}T${normalizedTime}`;
};

const isPastCalendarDate = (date?: Date | string) => {
  if (!date) return false;

  const targetDate = new Date(date);
  if (Number.isNaN(targetDate.getTime())) return false;

  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return targetDate < today;
};

const mapApiEventToEntity = (event: MonthlyCalendarEvent): MonthlyEventEntity => {
  const day = event.day ? format(new Date(event.day), 'yyyy-MM-dd') : '';
  const startTime = event.startTime ? format(new Date(event.startTime), 'HH:mm') : '';
  const endTime = event.endTime ? format(new Date(event.endTime), 'HH:mm') : '';
  const duration = event.duration ?? MonthlyCalendarDuration.Day;

  return {
    id: event.id,
    nameAr: event.nameAr,
    nameEn: event.nameEn,
    grades: (event.grade ?? []).map((grade) => ({
      id: grade.id,
      nameAr: grade.nameAr,
      nameEn: grade.nameEn,
    })),
    classRomms: (event.class ?? []).map((classroom) => ({
      id: classroom.id,
      nameAr: classroom.nameAr,
      nameEn: classroom.nameEn,
    })),
    day,
    duration,
    isFullDay: duration === MonthlyCalendarDuration.Day,
    startTime,
    endTime,
    schoolBranchesId: event.schoolBranchesId,
  };
};

const leaveDays = (leave: OfficialHoliday): Date[] => {
  if (!leave.startDate) return [];
  const start = new Date(leave.startDate);
  if (Number.isNaN(start.getTime())) return [];
  const end = leave.endDate ? new Date(leave.endDate) : start;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const last = new Date(Number.isNaN(end.getTime()) ? start : end);
  last.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  while (cursor <= last && days.length < MAX_LEAVE_DAYS) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

export default function MonthlyCalendar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { showSuccess, successPopup } = useSuccessPopup();
  const dispatch = useAppDispatch();
  const userData = localStorage.getItem('userData') || undefined;
  const schoolBranchId = userData ? JSON.parse(userData)?.schoolBranchId : undefined;

  const {
    events: apiEvents,
    isLoading,
    isDeleting,
  } = useAppSelector((state) => state.monthlyCalendar);
  const { educationalStages, isLoading: isEducationalStagesLoading } = useAppSelector(
    (state) => state.educationalStages
  );
  const { classrooms: classroomEntities, isLoading: isClassroomsLoading } = useAppSelector(
    (state) => state.classrooms
  );
  const hasRequestedClassroomsRef = useRef(false);
  const hasRequestedLeavesRef = useRef(false);
  const [leaves, setLeaves] = useState<OfficialHoliday[]>([]);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get(MONTHLY_SEARCH_PARAM) ?? '';
  const stageFilter = searchParams.get(MONTHLY_STAGE_PARAM) ?? '';
  const [typeFilter, setTypeFilter] = useState<MonthlyTypeFilter>('all');
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => toDayKey(new Date()));
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MonthlyEventEntity | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorInitialValues, setEditorInitialValues] = useState<MonthlyEventFormValues | null>(
    null
  );
  const [selectedDateForEditor, setSelectedDateForEditor] = useState<Date | undefined>(undefined);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventPendingDelete, setEventPendingDelete] = useState<MonthlyEventEntity | null>(null);
  const [selectedLeaveDay, setSelectedLeaveDay] = useState<string | null>(null);

  const educationalStagesCount = educationalStages.length;
  const currentLang = i18n.language;

  useEffect(() => {
    if (educationalStagesCount > 0) {
      return;
    }
    dispatch(
      getEducationalStages({
        pageIndex: 1,
        pageSize: EDUCATIONAL_STAGE_LOOKUP_LIMIT,
        schoolBranchId: schoolBranchId,
      })
    )
      .unwrap()
      .catch((error) => {
        showToast({
          message: getErrorMessage(error),
          type: 'error',
          isRaw: true,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, educationalStagesCount, showToast]);

  useEffect(() => {
    if (hasRequestedClassroomsRef.current) {
      return;
    }
    hasRequestedClassroomsRef.current = true;
    let isMounted = true;

    const loadClassrooms = async () => {
      try {
        await dispatch(
          fetchClassrooms({
            page: 1,
            limit: CLASSROOM_LOOKUP_LIMIT,
            filters: { schoolBranchId: schoolBranchId },
          })
        ).unwrap();
      } catch (error) {
        if (!isMounted) return;
        showToast({
          message: getErrorMessage(error),
          type: 'error',
          isRaw: true,
        });
      }
    };

    loadClassrooms();

    return () => {
      isMounted = false;
    };
  }, [dispatch, showToast, schoolBranchId]);

  useEffect(() => {
    if (!schoolBranchId || hasRequestedLeavesRef.current) {
      return;
    }
    hasRequestedLeavesRef.current = true;

    const loadLeaves = async () => {
      try {
        const response = await dispatch(fetchLeaveBySchoolBranch({ schoolBranchId })).unwrap();
        setLeaves(response.data);
      } catch (error) {
        showToast({
          message: getErrorMessage(error),
          type: 'error',
          isRaw: true,
        });
      }
    };

    loadLeaves();
  }, [dispatch, showToast, schoolBranchId]);

  const buildFilters = useCallback((): FetchMonthlyCalendarDashboardPayload => {
    const { start, end } = getGridRange(viewMonth);
    return {
      fromDate: `${toDayKey(start)}T00:00:00`,
      toDate: `${toDayKey(end)}T23:59:59`,
      schoolBranchId,
      grade: stageFilter || undefined,
      searchTerm: searchTerm.trim() || undefined,
    };
  }, [viewMonth, schoolBranchId, stageFilter, searchTerm]);

  const fetchEvents = useCallback(() => {
    return dispatch(fetchMonthlyCalendarDashboardEvents(buildFilters()));
  }, [dispatch, buildFilters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const normalizedEvents = useMemo<MonthlyEventEntity[]>(
    () => apiEvents.map((event) => mapApiEventToEntity(event)),
    [apiEvents]
  );

  const localizedName = useCallback(
    (item: { nameAr?: string | null; nameEn?: string | null }) =>
      (currentLang === 'ar' ? item.nameAr : item.nameEn || item.nameAr) || '',
    [currentLang]
  );

  const stageOptions = useMemo<CustomSelectOption[]>(
    () =>
      educationalStages.map((stage) => ({
        value: stage.id,
        label: currentLang === 'ar' ? stage.nameAr : stage.nameEn || stage.nameAr,
      })),
    [educationalStages, currentLang]
  );

  const stageFilterOptions = useMemo<CustomSelectOption[]>(
    () => [{ value: '', label: t('monthlyCalendar.filters.allStages') }, ...stageOptions],
    [stageOptions, t]
  );

  const eventItems = useMemo<MonthlyCalendarItem[]>(
    () =>
      normalizedEvents
        .filter((event) => event.day)
        .map((event) => {
          const fullDayLabel = t('monthlyCalendar.form.fullDay');
          const start = event.startTime ? formatTime(event.startTime, currentLang) : '';
          const end = event.endTime ? formatTime(event.endTime, currentLang) : '';
          const places = event.classRomms.length ? event.classRomms : event.grades;
          return {
            key: `event-${event.id}`,
            kind: 'event' as const,
            title: localizedName(event),
            day: event.day,
            chipLabel: event.isFullDay || !start ? fullDayLabel : start,
            timeLabel: event.isFullDay || !start ? fullDayLabel : end ? `${start} - ${end}` : start,
            locationLabel: places
              .map(localizedName)
              .filter(Boolean)
              .join(currentLang === 'ar' ? '، ' : ', '),
            tone: toneForId(event.id),
            event,
          };
        }),
    [normalizedEvents, localizedName, currentLang, t]
  );

  const holidayItems = useMemo<MonthlyCalendarItem[]>(
    () =>
      leaves.flatMap((leave) => {
        const days = leaveDays(leave);
        if (days.length === 0) return [];
        const range = formatDayRange(days[0], days[days.length - 1], currentLang);
        const title =
          (currentLang === 'ar' ? leave.reasonAr : leave.reasonEN || leave.reasonAr) || '';
        return days.map((date) => ({
          key: `leave-${leave.id}-${toDayKey(date)}`,
          kind: 'holiday' as const,
          title,
          day: toDayKey(date),
          chipLabel: range,
          timeLabel: range,
          tone: 'amber' as const,
          leave,
        }));
      }),
    [leaves, currentLang]
  );

  const itemsByDay = useMemo(() => {
    const visible = [
      ...(typeFilter === 'holidays' ? [] : eventItems),
      ...(typeFilter === 'events' ? [] : holidayItems),
    ];
    const map = new Map<string, MonthlyCalendarItem[]>();
    visible.forEach((item) => {
      const list = map.get(item.day) ?? [];
      list.push(item);
      map.set(item.day, list);
    });
    // Timed events first in time order, then full-day events, then holidays.
    const rank = (item: MonthlyCalendarItem) =>
      item.kind === 'holiday' ? '2' : item.event?.isFullDay ? '1' : `0${item.event?.startTime}`;
    map.forEach((list) => list.sort((a, b) => rank(a).localeCompare(rank(b))));
    return map;
  }, [eventItems, holidayItems, typeFilter]);

  const getLeavesForDay = useCallback(
    (dayKey: string): OfficialHoliday[] => {
      if (!dayKey) return [];
      return holidayItems
        .filter((item) => item.day === dayKey && item.leave)
        .map((item) => item.leave as OfficialHoliday);
    },
    [holidayItems]
  );

  const handleViewDetails = useCallback((event: MonthlyEventEntity) => {
    setSelectedEvent(event);
    setSelectedLeaveDay(null);
    setDetailsOpen(true);
  }, []);

  const handleViewDay = useCallback((dayKey: string) => {
    setSelectedEvent(null);
    setSelectedLeaveDay(dayKey);
    setDetailsOpen(true);
  }, []);

  const handleSelectDay = useCallback(
    (date: Date) => {
      setSelectedDay(toDayKey(date));
      if (!isSameMonth(date, viewMonth)) {
        setViewMonth(startOfMonth(date));
      }
    },
    [viewMonth]
  );

  const handleItemClick = useCallback(
    (item: MonthlyCalendarItem) => {
      setSelectedDay(item.day);
      if (item.event) {
        handleViewDetails(item.event);
      } else {
        handleViewDay(item.day);
      }
    },
    [handleViewDetails, handleViewDay]
  );

  const handleOpenAddPopup = useCallback(
    (date?: Date) => {
      if (isPastCalendarDate(date)) {
        showToast({
          message: t('monthlyCalendar.messages.cannotAddPastEvent'),
          type: 'error',
        });
        return;
      }

      setEditorMode('add');
      setEditingEventId(null);
      setEditorInitialValues(null);
      setSelectedDateForEditor(date);
      setIsEditorOpen(true);
    },
    [showToast, t]
  );

  const mapEventToFormValues = useCallback(
    (event: MonthlyEventEntity): MonthlyEventFormValues => ({
      nameAr: event.nameAr,
      nameEn: event.nameEn,
      grades: event.grades.map((grade) => grade.id),
      classRomms: event.classRomms.map((classroom) => classroom.id),
      day: event.day,
      isFullDay: event.isFullDay,
      duration: event.isFullDay
        ? MonthlyCalendarDuration.Day
        : MonthlyCalendarDuration.SpecificTime,
      startTime: event.startTime ?? '',
      endTime: event.endTime ?? '',
      schoolBranchesId: event.schoolBranchesId || schoolBranchId,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleOpenEditPopup = useCallback(
    (event: MonthlyEventEntity) => {
      setEditorMode('edit');
      setEditingEventId(event.id);
      setEditorInitialValues(mapEventToFormValues(event));
      setSelectedDateForEditor(undefined);
      setIsEditorOpen(true);
    },
    [mapEventToFormValues]
  );

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditorInitialValues(null);
    setSelectedDateForEditor(undefined);
    setEditingEventId(null);
  }, []);

  const transformValuesToRequest = (
    values: MonthlyEventFormValues
  ): CreateMonthlyCalendarRequest => {
    const dayISO = values.day
      ? `${values.day}T00:00:00`
      : format(new Date(), "yyyy-MM-dd'T'00:00:00");
    const startDateTime = values.isFullDay
      ? null
      : buildLocalIsoString(values.day, values.startTime || DEFAULT_CALENDAR_START);
    const endDateTime = values.isFullDay
      ? null
      : buildLocalIsoString(values.day, values.endTime || values.startTime || DEFAULT_CALENDAR_END);

    return {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      day: dayISO,
      duration: values.isFullDay
        ? MonthlyCalendarDuration.Day
        : MonthlyCalendarDuration.SpecificTime,
      startTime: startDateTime,
      endTime: endDateTime,
      schoolBranchesId: values.schoolBranchesId || schoolBranchId,
      grades: values.grades || [],
      classRomms: values.classRomms || [],
    };
  };

  const handleSaveEvent = useCallback(
    async (values: MonthlyEventFormValues) => {
      if (editorMode === 'add' && isPastCalendarDate(values.day)) {
        showToast({
          message: t('monthlyCalendar.messages.cannotAddPastEvent'),
          type: 'error',
        });
        return;
      }

      const payload = transformValuesToRequest(values);
      try {
        const res =
          editorMode === 'edit' && editingEventId
            ? await dispatch(
                updateMonthlyCalendarEvent({ id: editingEventId, data: payload })
              ).unwrap()
            : await dispatch(createMonthlyCalendarEvent(payload)).unwrap();

        if (res.isSuccess) {
          showSuccess(
            t(
              editorMode === 'edit'
                ? 'monthlyCalendar.messages.eventUpdated'
                : 'monthlyCalendar.messages.eventAdded'
            )
          );
          fetchEvents();
          handleCloseEditor();
          if (values.day) {
            handleSelectDay(fromDayKey(values.day));
          }
        } else {
          showToast({
            message: res.successMessage || t('common.errorOccurred'),
            type: 'error',
            isRaw: true,
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        const message =
          error?.message || (typeof error === 'string' ? error : t('common.errorOccurred'));
        showToast({ message, type: 'error', isRaw: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatch,
      editorMode,
      editingEventId,
      fetchEvents,
      handleCloseEditor,
      handleSelectDay,
      showToast,
      showSuccess,
      t,
    ]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!eventPendingDelete) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await dispatch(deleteMonthlyCalendarEvent(eventPendingDelete.id)).unwrap();
      if (res.isSuccess || res == eventPendingDelete.id) {
        setEventPendingDelete(null);
        showSuccess(t('monthlyCalendar.messages.eventDeleted'));
        fetchEvents();
      } else {
        const errorMessage = res.successMessage || t('common.errorOccurred');
        showToast({ message: errorMessage, type: 'error', isRaw: true });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setEventPendingDelete(null);
      const message =
        error?.message || (typeof error === 'string' ? error : t('common.errorOccurred'));
      showToast({ message, type: 'error', isRaw: true });
    }
  }, [dispatch, eventPendingDelete, fetchEvents, showToast, showSuccess, t]);

  const detailsLeaves = useMemo<OfficialHoliday[]>(
    () => getLeavesForDay(selectedEvent?.day ?? selectedLeaveDay ?? ''),
    [selectedEvent?.day, selectedLeaveDay, getLeavesForDay]
  );

  const handlePrint = () => {
    const area = document.getElementById(PRINT_AREA_ID);
    if (area)
      printElement(
        area,
        `${t('monthlyCalendar.title')} - ${formatMonthYear(viewMonth, currentLang)}`
      );
  };

  const selectedDayDate = fromDayKey(selectedDay);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <MonthlyCalendarToolbar
          monthLabel={formatMonthYear(viewMonth, currentLang)}
          onPreviousMonth={() => setViewMonth((month) => addMonths(month, -1))}
          onNextMonth={() => setViewMonth((month) => addMonths(month, 1))}
          onAddEvent={() =>
            handleOpenAddPopup(isPastCalendarDate(selectedDayDate) ? undefined : selectedDayDate)
          }
          onPrint={handlePrint}
          onOpenSettings={() => navigate('/calendar/academic')}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          stageOptions={stageFilterOptions}
          isStageOptionsLoading={isEducationalStagesLoading}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div id={PRINT_AREA_ID} className="xl:col-span-9">
          <MonthlyCalendarGrid
            month={viewMonth}
            selectedDay={selectedDay}
            itemsByDay={itemsByDay}
            isLoading={isLoading}
            canAddOn={(date) => !isPastCalendarDate(date)}
            onSelectDay={handleSelectDay}
            onItemClick={handleItemClick}
            onAddEvent={handleOpenAddPopup}
            onViewDay={handleViewDay}
          />
        </div>
        <div className="xl:col-span-3">
          <MonthlyDayPanel
            dayKey={selectedDay}
            items={itemsByDay.get(selectedDay) ?? []}
            onViewItem={handleItemClick}
            onEditEvent={handleOpenEditPopup}
            onDeleteEvent={setEventPendingDelete}
            onViewAll={handleViewDay}
          />
        </div>
      </div>

      <AddEditMonthlyEventPopup
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        onSubmit={handleSaveEvent}
        initialValues={editorInitialValues ?? undefined}
        selectedDate={editorMode === 'add' ? selectedDateForEditor : undefined}
        mode={editorMode}
        gradeOptions={stageOptions}
        classroomEntities={classroomEntities}
        schoolBranchId={schoolBranchId}
        gradeOptionsLoading={isEducationalStagesLoading}
        classroomOptionsLoading={isClassroomsLoading}
      />

      <MonthlyEventDetailsPopup
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedEvent(null);
          setSelectedLeaveDay(null);
        }}
        onEdit={(item) => {
          setDetailsOpen(false);
          setSelectedEvent(null);
          setSelectedLeaveDay(null);
          handleOpenEditPopup(item);
        }}
        event={selectedEvent}
        date={selectedLeaveDay ?? undefined}
        leaves={detailsLeaves}
        filterOptions={{ grade: stageFilter, searchTerm: searchTerm }}
      />

      {successPopup}

      <DeletePopup
        open={Boolean(eventPendingDelete)}
        message="monthlyCalendar.actions.confirmDelete"
        itemName={eventPendingDelete ? localizedName(eventPendingDelete) : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventPendingDelete(null)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </div>
  );
}
