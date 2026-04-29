import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Card from '@/shared/components/Card';
import SharedCalendar, {
  type CalendarEvent,
  type ContextMenuAction,
} from '@/shared/components/SharedCalendar';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import DeletePopup from '@/shared/popups/DeletePopup';
import AddEditMonthlyEventPopup from '../popups/AddEditMonthlyEventPopup';
import MonthlyEventDetailsPopup from '../popups/MonthlyEventDetailsPopup';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';
import { useToast } from '@/shared/context/ToastContext';
import {
  createMonthlyCalendarEvent,
  deleteMonthlyCalendarEvent,
  fetchMonthlyCalendarEvents,
  updateMonthlyCalendarEvent,
  type MonthlyCalendarFilters,
} from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { getEducationalStages } from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import type {
  CreateMonthlyCalendarRequest,
  MonthlyCalendarEvent,
  MonthlyEventEntity,
} from '@/services/api/types/monthly-calendar.types';
import type { MonthlyEventFormValues } from '@/validations/monthly-calendar-validations';
import { getErrorMessage } from '@/lib/http';
import { MonthlyCalendarDuration } from '@/shared/enums/enums';
import Loading from '@/shared/components/Loading';

type CalendarMonthlyEvent = CalendarEvent & { meta: MonthlyEventEntity };

export type MonthlyCalendarHandle = {
  openAddEvent: (date?: Date) => void;
};

const DEFAULT_CALENDAR_START = '08:00';
const DEFAULT_CALENDAR_END = '18:00';
const CLASSROOM_LOOKUP_LIMIT = 10000;
const EDUCATIONAL_STAGE_LOOKUP_LIMIT = 10000;

const normalizeTime = (time: string) => (time.length === 5 ? `${time}:00` : time);

const buildDateTime = (date: string, time: string) => {
  if (!date) return new Date();
  const normalizedTime = time ? normalizeTime(time) : normalizeTime(DEFAULT_CALENDAR_START);
  return new Date(`${date}T${normalizedTime}`);
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

const MonthlyCalendar = forwardRef<MonthlyCalendarHandle>(function MonthlyCalendar(_props, ref) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
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
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MonthlyEventEntity | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'add' | 'edit'>('add');
  const [editorInitialValues, setEditorInitialValues] = useState<MonthlyEventFormValues | null>(
    null
  );
  const [selectedDateForEditor, setSelectedDateForEditor] = useState<Date | undefined>(undefined);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventIdPendingDelete, setEventIdPendingDelete] = useState<string | null>(null);

  const educationalStagesCount = educationalStages.length;

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

  const buildFilters = useCallback((): MonthlyCalendarFilters => {
    const filters: MonthlyCalendarFilters = {};
    if (searchTerm.trim()) {
      filters.searchTerm = searchTerm.trim();
    }
    if (stageFilter) {
      filters.grade = stageFilter;
    }
    if (schoolBranchId) {
      filters.schoolBranchId = schoolBranchId;
    }

    return filters;
  }, [searchTerm, stageFilter]);

  const fetchEvents = useCallback(() => {
    return dispatch(
      fetchMonthlyCalendarEvents({
        filters: buildFilters(),
      })
    );
  }, [dispatch, buildFilters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const normalizedEvents = useMemo<MonthlyEventEntity[]>(
    () => apiEvents.map((event) => mapApiEventToEntity(event)),
    [apiEvents]
  );

  const currentLang = i18n.language;

  const getLocalizedName = useCallback(
    (event: MonthlyEventEntity) =>
      currentLang === 'ar' ? event.nameAr : event.nameEn || event.nameAr,
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

  const calendarEvents = useMemo<CalendarMonthlyEvent[]>(() => {
    return normalizedEvents.map((event) => {
      const startTime = event.isFullDay
        ? DEFAULT_CALENDAR_START
        : event.startTime || DEFAULT_CALENDAR_START;
      const endTime = event.isFullDay
        ? DEFAULT_CALENDAR_END
        : event.endTime || event.startTime || DEFAULT_CALENDAR_END;

      return {
        id: event.id,
        title: getLocalizedName(event),
        start: buildDateTime(event.day, startTime),
        end: buildDateTime(event.day, endTime),
        meta: event,
      };
    });
  }, [normalizedEvents, getLocalizedName]);

  const handleViewDetails = useCallback((event: MonthlyEventEntity) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  }, []);

  const handleOpenAddPopup = useCallback((date?: Date) => {
    setEditorMode('add');
    setEditingEventId(null);
    setEditorInitialValues(null);
    setSelectedDateForEditor(date);
    setIsEditorOpen(true);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      openAddEvent: (date?: Date) => {
        handleOpenAddPopup(date);
      },
    }),
    [handleOpenAddPopup]
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
    const dayISO = values.day ? new Date(`${values.day}T00:00:00.000Z`) : new Date();
    const startDateTime = values.isFullDay
      ? null
      : buildDateTime(values.day, values.startTime || DEFAULT_CALENDAR_START).toISOString();
    const endDateTime = values.isFullDay
      ? null
      : buildDateTime(
          values.day,
          values.endTime || values.startTime || DEFAULT_CALENDAR_END
        ).toISOString();

    return {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      day: dayISO.toISOString(),
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
      const payload = transformValuesToRequest(values);
      try {
        if (editorMode === 'edit' && editingEventId) {
          const res = await dispatch(
            updateMonthlyCalendarEvent({ id: editingEventId, data: payload })
          ).unwrap();
          if (res.isSuccess) {
            showToast({ message: t('monthlyCalendar.messages.eventUpdated'), type: 'success' });
            fetchEvents();
            handleCloseEditor();
          } else {
            const errorMessage = res.successMessage || t('common.errorOccurred');
            showToast({
              message: errorMessage,
              type: 'error',
              isRaw: true,
            });
          }
        } else {
          const res = await dispatch(createMonthlyCalendarEvent(payload)).unwrap();
          if (res.isSuccess) {
            showToast({ message: t('monthlyCalendar.messages.eventAdded'), type: 'success' });
            fetchEvents();
            handleCloseEditor();
          } else {
            const errorMessage = res.successMessage || t('common.errorOccurred');
            showToast({
              message: errorMessage,
              type: 'error',
              isRaw: true,
            });
          }
        }
      } catch (error: any) {
        const message =
          error?.message || (typeof error === 'string' ? error : t('common.errorOccurred'));
        showToast({ message, type: 'error', isRaw: true });
      }
    },
    [dispatch, editorMode, editingEventId, fetchEvents, handleCloseEditor, showToast, t]
  );

  const handleRequestDelete = useCallback((eventId: string) => {
    setEventIdPendingDelete(eventId);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!eventIdPendingDelete) return;
    try {
      const res: any = await dispatch(deleteMonthlyCalendarEvent(eventIdPendingDelete)).unwrap();
      if (res.isSuccess || res == eventIdPendingDelete) {
        setEventIdPendingDelete(null);
        showToast({ message: t('monthlyCalendar.messages.eventDeleted'), type: 'success' });
        fetchEvents();
      } else {
        const errorMessage = res.successMessage || t('common.errorOccurred');
        showToast({ message: errorMessage, type: 'error', isRaw: true });
      }
    } catch (error: any) {
      setEventIdPendingDelete(null);
      const message =
        error?.message || (typeof error === 'string' ? error : t('common.errorOccurred'));
      showToast({ message, type: 'error', isRaw: true });
    }
  }, [dispatch, eventIdPendingDelete, fetchEvents, showToast, t]);

  const resolveEvent = useCallback(
    (calendarEvent?: CalendarEvent) => {
      if (!calendarEvent) return undefined;
      const withMeta = calendarEvent as CalendarMonthlyEvent;
      if (withMeta.meta) return withMeta.meta;
      return normalizedEvents.find((event) => event.id === calendarEvent.id);
    },
    [normalizedEvents]
  );

  const hasMultipleEventsOnDay = useCallback(
    (day: string) => {
      if (!day) return false;
      return normalizedEvents.filter((event) => event.day === day).length > 1;
    },
    [normalizedEvents]
  );

  const contextMenuActions = useMemo<ContextMenuAction[]>(
    () => [
      {
        label: t('monthlyCalendar.actions.viewDetails'),
        icon: EyeFillIcon,
        onClick: (_date, calendarEvent) => {
          const event = resolveEvent(calendarEvent);
          if (event) {
            handleViewDetails(event);
          }
        },
        color: 'primary',
        showOnDate: false,
        showOnEvent: true,
      },
      {
        label: t('monthlyCalendar.actions.addEvent'),
        icon: GreenPlusIcon,
        onClick: (date) => handleOpenAddPopup(date),
      },
      {
        label: t('monthlyCalendar.actions.editEvent'),
        icon: EditFillIcon,
        onClick: (_date, calendarEvent) => {
          const event = resolveEvent(calendarEvent);
          if (event && !hasMultipleEventsOnDay(event.day)) {
            handleOpenEditPopup(event);
          }
        },
        color: 'success',
        showOnDate: false,
        showOnEvent: true,
        hidden: (_date, calendarEvent) => {
          const event = resolveEvent(calendarEvent);
          return event ? hasMultipleEventsOnDay(event.day) : false;
        },
      },
      {
        label: t('monthlyCalendar.actions.deleteEvent'),
        icon: TrashFillIcon,
        onClick: (_date, calendarEvent) => {
          const event = resolveEvent(calendarEvent);
          if (event) {
            if (!hasMultipleEventsOnDay(event.day)) {
              handleRequestDelete(event.id);
            }
          }
        },
        color: 'danger',
        showOnDate: false,
        showOnEvent: true,
        hidden: (_date, calendarEvent) => {
          const event = resolveEvent(calendarEvent);
          return event ? hasMultipleEventsOnDay(event.day) : false;
        },
      },
    ],
    [
      handleOpenAddPopup,
      handleOpenEditPopup,
      handleRequestDelete,
      handleViewDetails,
      hasMultipleEventsOnDay,
      resolveEvent,
      t,
    ]
  );

  const hasActiveFilters = Boolean(searchTerm.trim() || stageFilter);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStageFilter('');
  };

  return (
    <>
      <Card>
        <div className="mb-5 flex justify-between gap-3">
          <div className="mb-6 flex flex-1 flex-wrap gap-4 lg:flex-nowrap">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t('monthlyCalendar.searchPlaceholder')}
              wrapperClassName="w-[300px]"
            />
            <CustomSelect
              value={stageFilter}
              onChange={(value) => setStageFilter(Array.isArray(value) ? (value[0] ?? '') : value)}
              options={stageFilterOptions}
              placeholder={t('monthlyCalendar.filters.stagePlaceholder')}
              className="w-[250px]"
              showSearch={false}
              disabled={isEducationalStagesLoading}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex h-[40px] items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-100 px-3 text-base font-normal text-green-500 transition-colors hover:bg-green-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              title={t('actions.clearFilter')}
            >
              <img src={CancelXGreenIcon} alt="X" aria-hidden="true" className="h-5 w-5" />
              <span>{t('actions.clearFilter')}</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <Loading size="lg" />
        ) : (
          <SharedCalendar
            events={calendarEvents}
            onSelectEvent={(calendarEvent) => {
              const event = resolveEvent(calendarEvent);
              if (event) {
                handleViewDetails(event);
              }
            }}
            contextMenuActions={contextMenuActions}
            defaultView="month"
          />
        )}
      </Card>

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
        }}
        onEdit={(item) => {
          setDetailsOpen(false);
          setSelectedEvent(null);
          handleOpenEditPopup(item);
        }}
        event={selectedEvent}
      />

      <DeletePopup
        open={Boolean(eventIdPendingDelete)}
        message="monthlyCalendar.actions.confirmDelete"
        itemName={calendarEvents.find((event) => event.id === eventIdPendingDelete)?.title ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventIdPendingDelete(null)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
});

export default MonthlyCalendar;
