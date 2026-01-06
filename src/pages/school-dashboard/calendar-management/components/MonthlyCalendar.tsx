import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Card from '@/shared/components/Card';
import SharedCalendar, {
  type CalendarEvent,
  type ContextMenuAction,
} from '@/shared/components/SharedCalendar';
import SearchInput from '@/shared/components/SearchInput';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import EmptyState from '@/shared/components/EmptyState';
import DeletePopup from '@/shared/popups/DeletePopup';
import AddEditMonthlyEventPopup from '../popups/AddEditMonthlyEventPopup';
import MonthlyEventDetailsPopup from '../popups/MonthlyEventDetailsPopup';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import GreenPlusIcon from '@gradex/assets/icons/GreenPlus.svg';
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import StyledCalendarIcon from '@gradex/assets/icons/StyledCalendar.svg';
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
import { classroomApiService } from '@/services/api/classrooms/classrooms.service';
import type { Classroom } from '@/services/api/types/classrooms.types';
import type {
  CreateMonthlyCalendarRequest,
  MonthlyCalendarEvent,
  MonthlyEventEntity,
} from '@/services/api/types/monthly-calendar.types';
import type { MonthlyEventFormValues } from '@/validations/monthly-calendar-validations';
import { STATIC_SCHOOL_BRANCH_ID } from '@/redux/features/teacher-attendance/teacherAttendanceSlice';
import { getErrorMessage } from '@/lib/http';

type CalendarMonthlyEvent = CalendarEvent & { meta: MonthlyEventEntity };

export type MonthlyCalendarHandle = {
  openAddEvent: (date?: Date) => void;
};

const DEFAULT_CALENDAR_START = '08:00';
const DEFAULT_CALENDAR_END = '18:00';
const DEFAULT_PAGE_INDEX = 1;
const DEFAULT_PAGE_SIZE = 200;
const CLASSROOM_LOOKUP_LIMIT = 1000;
const EDUCATIONAL_STAGE_LOOKUP_LIMIT = 1000;
const CUSTOM_DURATION = 1;
const FULL_DAY_DURATION = 2;

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
  const duration = event.duration ?? FULL_DAY_DURATION;

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
    isFullDay: duration === FULL_DAY_DURATION,
    startTime,
    endTime,
    schoolBranchesId: event.schoolBranchesId,
  };
};

const MonthlyCalendar = forwardRef<MonthlyCalendarHandle>(function MonthlyCalendar(_props, ref) {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const {
    events: apiEvents,
    isLoading,
    isDeleting,
  } = useAppSelector((state) => state.monthlyCalendar);
  const { educationalStages, isLoading: isEducationalStagesLoading } = useAppSelector(
    (state) => state.educationalStages
  );

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isClassroomsLoading, setIsClassroomsLoading] = useState(false);
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
      })
    );
  }, [dispatch, educationalStagesCount]);

  useEffect(() => {
    let isMounted = true;

    const loadClassrooms = async () => {
      try {
        setIsClassroomsLoading(true);
        const response = await classroomApiService.getClassrooms({
          pageIndex: 1,
          pageSize: CLASSROOM_LOOKUP_LIMIT,
        });
        if (!isMounted) return;
        const list = response.data?.classroomDto ?? [];
        setClassrooms(list);
      } catch (error) {
        if (!isMounted) return;
        showToast({
          message: getErrorMessage(error),
          type: 'error',
          isRaw: true,
        });
      } finally {
        if (isMounted) {
          setIsClassroomsLoading(false);
        }
      }
    };

    loadClassrooms();

    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const buildFilters = useCallback((): MonthlyCalendarFilters => {
    const filters: MonthlyCalendarFilters = {};
    if (searchTerm.trim()) {
      filters.searchTerm = searchTerm.trim();
    }
    if (stageFilter) {
      filters.stageId = stageFilter;
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

  const classroomOptions = useMemo<CustomSelectOption[]>(
    () =>
      classrooms.map((classroom) => ({
        value: classroom.id,
        label: currentLang === 'ar' ? classroom.name : classroom.nameEn || classroom.name,
      })),
    [classrooms, currentLang]
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
      duration: event.isFullDay ? FULL_DAY_DURATION : CUSTOM_DURATION,
      startTime: event.startTime ?? '',
      endTime: event.endTime ?? '',
      schoolBranchesId: event.schoolBranchesId || STATIC_SCHOOL_BRANCH_ID,
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
    const dayISO = values.day ? new Date(`${values.day}T00:00:00`) : new Date();
    const startTime = values.isFullDay
      ? buildDateTime(values.day, DEFAULT_CALENDAR_START)
      : buildDateTime(values.day, values.startTime || DEFAULT_CALENDAR_START);
    const endTime = values.isFullDay
      ? buildDateTime(values.day, DEFAULT_CALENDAR_END)
      : buildDateTime(values.day, values.endTime || values.startTime || DEFAULT_CALENDAR_END);

    return {
      nameAr: values.nameAr,
      nameEn: values.nameEn,
      day: dayISO.toISOString(),
      duration: values.isFullDay ? FULL_DAY_DURATION : CUSTOM_DURATION,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      schoolBranchesId: values.schoolBranchesId || STATIC_SCHOOL_BRANCH_ID,
      grades: values.grades,
      classRomms: values.classRomms,
    };
  };

  const handleSaveEvent = useCallback(
    async (values: MonthlyEventFormValues) => {
      const payload = transformValuesToRequest(values);
      try {
        if (editorMode === 'edit' && editingEventId) {
          await dispatch(updateMonthlyCalendarEvent({ id: editingEventId, data: payload }))
            .unwrap()
            .then((res) => {
              if (res.isSuccess) {
                showToast({ message: t('monthlyCalendar.messages.eventUpdated'), type: 'success' });
                fetchEvents();
              } else {
                showToast({ message: t('common.errorOccurred'), type: 'error' });
              }
            });
        } else {
          await dispatch(createMonthlyCalendarEvent(payload))
            .unwrap()
            .then((res) => {
              if (res.isSuccess) {
                showToast({ message: t('monthlyCalendar.messages.eventAdded'), type: 'success' });
                fetchEvents();
              } else {
                showToast({ message: t('common.errorOccurred'), type: 'error' });
              }
            });
        }
        handleCloseEditor();
      } catch (error) {
        const message = typeof error === 'string' ? error : t('common.errorOccurred');
        showToast({ message, type: 'error', isRaw: typeof error === 'string' });
        throw error;
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
      await dispatch(deleteMonthlyCalendarEvent(eventIdPendingDelete))
        .unwrap()
        .then((res: any) => {
          if (res.isSuccess || res == eventIdPendingDelete) {
            setEventIdPendingDelete(null);
            showToast({ message: t('monthlyCalendar.messages.eventDeleted'), type: 'success' });
            fetchEvents();
          } else {
            showToast({ message: t('common.errorOccurred'), type: 'error' });
          }
        });
    } catch (error) {
      const message = typeof error === 'string' ? error : t('common.errorOccurred');
      showToast({ message, type: 'error', isRaw: typeof error === 'string' });
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
          if (event) {
            handleOpenEditPopup(event);
          }
        },
        color: 'success',
        showOnDate: false,
        showOnEvent: true,
      },
      {
        label: t('monthlyCalendar.actions.deleteEvent'),
        icon: TrashFillIcon,
        onClick: (_date, calendarEvent) => {
          const event = resolveEvent(calendarEvent);
          if (event) {
            handleRequestDelete(event.id);
          }
        },
        color: 'danger',
        showOnDate: false,
        showOnEvent: true,
      },
    ],
    [
      handleOpenAddPopup,
      handleOpenEditPopup,
      handleRequestDelete,
      handleViewDetails,
      resolveEvent,
      t,
    ]
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setStageFilter('');
  };

  const showEmptyState = !isLoading && calendarEvents.length === 0;

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
          <button
            onClick={handleResetFilters}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
            title={t('actions.clearFilter')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M21 12a9 9 0 1 0-3.46 6.54"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v6h-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            {t('loading.loading')}
          </div>
        ) : showEmptyState ? (
          <EmptyState
            imgSrc={StyledCalendarIcon}
            title={t('monthlyCalendar.emptyStateTitle')}
            description={t('monthlyCalendar.emptyStateDescription')}
            actionLabel={t('monthlyCalendar.addEventButton')}
            onAction={() => handleOpenAddPopup()}
          />
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
        classroomOptions={classroomOptions}
        schoolBranchId={STATIC_SCHOOL_BRANCH_ID}
        gradeOptionsLoading={isEducationalStagesLoading}
        classroomOptionsLoading={isClassroomsLoading}
      />

      <MonthlyEventDetailsPopup
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />

      <DeletePopup
        open={Boolean(eventIdPendingDelete)}
        message="monthlyCalendar.actions.confirmDelete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setEventIdPendingDelete(null)}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
});

export default MonthlyCalendar;
