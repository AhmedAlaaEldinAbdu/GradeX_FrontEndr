import { forwardRef, useImperativeHandle, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { startOfWeek, addDays, parseISO, startOfDay, isBefore, isEqual } from 'date-fns';
import WeeklyScheduleCalendar, {
  type ScheduleLesson,
  type ScheduleEvent,
  type PeriodHeader,
  type PeriodSlot,
  type SpecialColumn,
  type LessonContextAction,
} from '@/shared/components/WeeklyScheduleCalendar';
import CustomSelect from '@/shared/components/CustomSelect';
import LessonDetailsPopup from '../popups/LessonDetailsPopup';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchLessons,
  fetchLessonByIdSilent,
  updateLesson,
  deleteLessonById,
  recoverAllLessons,
} from '@/redux/features/lessons/lessonsSlice';
import { fetchMonthlyCalendarEvents } from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import { fetchAcademicCalendarsForWeek } from '@/redux/features/academic-calendar/academicCalendarSlice';
import { getAcademicSystems } from '@/redux/features/academic-system/academicSystemSlice';
import {
  getEducationalStages,
  getEducationalStagesBySubSystemId,
} from '@/redux/features/educational-stages/educationalStagesSlice';
import { fetchClassrooms } from '@/redux/features/classrooms/classroomsSlice';
import type { Lesson } from '@/services/api/types/lessons.types';
import type { MonthlyCalendarEvent } from '@/services/api/types/monthly-calendar.types';
import type {
  AcademicCalendarEntity,
  AcademicCalendarTimedSchedule,
} from '@/services/api/types/academic-calendar.types';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import EditFilledIcon from '@gradex/assets/icons/EditFilled.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useLanguage } from '@/hooks/useLanguage';
import { addMinutesToTime } from '@/lib/utils/date-utils';
import { tokenManager } from '@/lib/auth/token-manager';
import CancelXGreenIcon from '@gradex/assets/icons/CancelXGreen.svg';

// Default period slots — used when the academic calendar hasn't loaded yet.
// Each cell is 45 minutes from 08:30 to 15:15.
const DEFAULT_PERIOD_TIME_SLOTS: PeriodSlot[] = [
  { periodIndex: 0, label: '1', startHour: 8, startMin: 30, endHour: 9, endMin: 15 },
  { periodIndex: 1, label: '2', startHour: 9, startMin: 15, endHour: 10, endMin: 0 },
  { periodIndex: 2, label: '3', startHour: 10, startMin: 0, endHour: 10, endMin: 45 },
  { periodIndex: 3, label: '4', startHour: 10, startMin: 45, endHour: 11, endMin: 30 },
  { periodIndex: 4, label: '5', startHour: 11, startMin: 30, endHour: 12, endMin: 15 },
  { periodIndex: 5, label: '6', startHour: 12, startMin: 15, endHour: 13, endMin: 0 },
  { periodIndex: 6, label: '7', startHour: 13, startMin: 0, endHour: 13, endMin: 45 },
  { periodIndex: 7, label: '8', startHour: 13, startMin: 45, endHour: 14, endMin: 30 },
  { periodIndex: 8, label: '9', startHour: 14, startMin: 30, endHour: 15, endMin: 15 },
];

/**
 * Build period slots from the academic calendar.
 * Cell duration = `lessonDuration` (minutes). Slots are generated from
 * `dayStartTime` until `dayEndTime`, dropping any final partial cell.
 */
const buildPeriodSlots = (
  dayStartTime: string | null | undefined,
  dayEndTime: string | null | undefined,
  lessonDuration: number | null | undefined
): PeriodSlot[] => {
  if (!dayStartTime || !dayEndTime || !lessonDuration || lessonDuration <= 0) {
    return DEFAULT_PERIOD_TIME_SLOTS;
  }
  const start = parseTimeString(dayStartTime);
  const end = parseTimeString(dayEndTime);
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;
  if (endMinutes <= startMinutes) {
    return DEFAULT_PERIOD_TIME_SLOTS;
  }

  const slots: PeriodSlot[] = [];
  let cursor = startMinutes;
  let idx = 0;
  while (cursor + lessonDuration <= endMinutes) {
    const slotEnd = cursor + lessonDuration;
    slots.push({
      periodIndex: idx,
      label: String(idx + 1),
      startHour: Math.floor(cursor / 60),
      startMin: cursor % 60,
      endHour: Math.floor(slotEnd / 60),
      endMin: slotEnd % 60,
    });
    cursor = slotEnd;
    idx += 1;
  }

  return slots.length > 0 ? slots : DEFAULT_PERIOD_TIME_SLOTS;
};

// Subject color mapping
const SUBJECT_COLORS: Record<string, ScheduleLesson['color']> = {
  عربي: 'arabic',
  'اللغة العربية': 'arabic',
  ماث: 'math',
  رياضيات: 'math',
  علوم: 'science',
  'اللغة الانجليزية': 'english',
  انجليزي: 'english',
  english: 'english',
};

/**
 * Get the day index (0-6) for a given date
 * Saturday = 0, Sunday = 1, ..., Friday = 6
 */
const getDayIndexFromDate = (date: Date): number => {
  const jsDay = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  // Convert to our format: Saturday=0, Sunday=1, Monday=2, etc.
  return jsDay === 6 ? 0 : jsDay + 1;
};

/**
 * Get period index based on time and the active period slots.
 */
const getPeriodIndexFromTime = (hours: number, minutes: number, slots: PeriodSlot[]): number => {
  const timeInMinutes = hours * 60 + minutes;

  for (const slot of slots) {
    const slotStart = slot.startHour * 60 + slot.startMin;
    const slotEnd = slot.endHour * 60 + slot.endMin;

    if (timeInMinutes >= slotStart && timeInMinutes < slotEnd) {
      return slot.periodIndex;
    }
  }

  const firstSlotStart = slots[0].startHour * 60 + slots[0].startMin;
  if (timeInMinutes < firstSlotStart) {
    return 0;
  }

  return slots.length - 1;
};

/**
 * Parse time string "HH:mm:ss" to hours and minutes
 */
const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  const parts = timeStr.split(':');
  return {
    hours: parseInt(parts[0], 10),
    minutes: parseInt(parts[1], 10),
  };
};

/**
 * Format time from "HH:mm:ss" to "H:mm" display format
 */
const formatTimeDisplay = (timeStr: string): string => {
  const { hours, minutes } = parseTimeString(timeStr);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Calculate lesson duration in minutes
 */
const calculateDuration = (startTime: string, endTime: string): number => {
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;
  return endMinutes - startMinutes;
};

/**
 * Get color for subject based on subject name
 */
const getSubjectColor = (subjectName: string): ScheduleLesson['color'] => {
  // Check for exact match first
  if (SUBJECT_COLORS[subjectName]) {
    return SUBJECT_COLORS[subjectName];
  }

  // Check for partial match
  const lowerName = subjectName.toLowerCase();
  for (const [key, color] of Object.entries(SUBJECT_COLORS)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return color;
    }
  }

  return 'default';
};

/**
 * Get the date for a specific day index within a week
 * dayIndex: 0=Saturday, 1=Sunday, ..., 6=Friday
 */
const getDateForDayInWeek = (weekStart: Date, dayIndex: number): Date => {
  return addDays(weekStart, dayIndex);
};

/**
 * Find the lesson for a specific day and period within a week.
 */
const findApplicableLessonForSlot = (
  lessons: Lesson[],
  dayIndex: number,
  periodIndex: number,
  weekStart: Date,
  lang: string,
  periodSlots: PeriodSlot[]
): ScheduleLesson | null => {
  const currentDayDate = startOfDay(getDateForDayInWeek(weekStart, dayIndex));

  const matchingLessons = lessons.filter((lesson) => {
    const lessonDate = startOfDay(parseISO(lesson.date));
    if (!isEqual(lessonDate, currentDayDate)) {
      return false;
    }

    const startTimeParsed = parseTimeString(lesson.startTime);
    const lessonPeriodIndex = getPeriodIndexFromTime(
      startTimeParsed.hours,
      startTimeParsed.minutes,
      periodSlots
    );
    return lessonPeriodIndex === periodIndex;
  });

  if (matchingLessons.length === 0) {
    return null;
  }

  // Defensive tie-breaker if duplicates exist for the same date+slot.
  matchingLessons.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  const mostRecentLesson = matchingLessons[0];

  // Get subject name based on language
  const subjectName =
    lang === 'ar'
      ? mostRecentLesson.materialNameAr
      : mostRecentLesson.materialNameEn || mostRecentLesson.materialNameAr;

  // Calculate duration in minutes
  const duration = calculateDuration(mostRecentLesson.startTime, mostRecentLesson.endTime);

  // colSpan is the lesson duration relative to one period cell (any custom duration).
  const slot = periodSlots[periodIndex];
  const slotDurationMinutes = slot
    ? slot.endHour * 60 + slot.endMin - (slot.startHour * 60 + slot.startMin)
    : 45;
  const colSpan = Math.max(1, duration / slotDurationMinutes);

  // Calculate start offset for lessons not starting at period boundaries
  let startOffset = 0;
  if (slot) {
    const slotStartMinutes = slot.startHour * 60 + slot.startMin;
    const lessonStartParts = parseTimeString(mostRecentLesson.startTime);
    const lessonStartMinutes = lessonStartParts.hours * 60 + lessonStartParts.minutes;

    const diffMinutes = lessonStartMinutes - slotStartMinutes;
    if (diffMinutes > 0 && diffMinutes < slotDurationMinutes) {
      startOffset = diffMinutes / slotDurationMinutes;
    }
  }

  return {
    id: mostRecentLesson.id,
    subject: subjectName,
    teacherName: mostRecentLesson.teacherName,
    startTime: formatTimeDisplay(mostRecentLesson.startTime),
    endTime: formatTimeDisplay(mostRecentLesson.endTime),
    duration,
    dayIndex,
    periodIndex,
    colSpan,
    startOffset,
    color: getSubjectColor(subjectName),
  };
};

/**
 * Transform API Lessons to ScheduleLessons for the current week. Each lesson
 * is rendered only on its own exact date — no week-over-week repetition.
 */
const transformLessonsForWeek = (
  apiLessons: Lesson[],
  weekStart: Date,
  lang: string,
  periodSlots: PeriodSlot[]
): ScheduleLesson[] => {
  const scheduleLessons: ScheduleLesson[] = [];
  const processedSlots = new Set<string>();

  for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
    for (let periodIndex = 0; periodIndex < periodSlots.length; periodIndex++) {
      const slotKey = `${dayIndex}-${periodIndex}`;

      if (processedSlots.has(slotKey)) {
        continue;
      }

      const lesson = findApplicableLessonForSlot(
        apiLessons,
        dayIndex,
        periodIndex,
        weekStart,
        lang,
        periodSlots
      );

      if (lesson) {
        scheduleLessons.push(lesson);
        processedSlots.add(slotKey);
      }
    }
  }

  return scheduleLessons;
};

// Event color options are limited to the supported shared badge palette.
const EVENT_COLORS: ScheduleEvent['color'][] = ['green', 'yellow', 'default'];

const getEventColor = (index: number): ScheduleEvent['color'] => {
  return EVENT_COLORS[index % EVENT_COLORS.length];
};

const getEventPeriodRange = (
  startTime: string | null | undefined,
  duration: number,
  periodSlots: PeriodSlot[]
): { startPeriod: number; endPeriod: number } => {
  if (!startTime || periodSlots.length === 0) {
    return { startPeriod: 0, endPeriod: 0 };
  }

  const timeOnly = startTime.includes('T') ? startTime.split('T')[1] : startTime;
  if (!timeOnly) {
    return { startPeriod: 0, endPeriod: 0 };
  }

  const startTimeParsed = parseTimeString(timeOnly);
  const startPeriod = getPeriodIndexFromTime(
    startTimeParsed.hours,
    startTimeParsed.minutes,
    periodSlots
  );

  // `duration` is in hours from the API. Convert to minutes, then divide by
  // the active slot length (which equals the academic-calendar lessonDuration).
  const firstSlot = periodSlots[0];
  const slotDurationMinutes =
    firstSlot.endHour * 60 + firstSlot.endMin - (firstSlot.startHour * 60 + firstSlot.startMin);
  const durationMinutes = duration * 60;
  const periodsToSpan = Math.max(1, Math.ceil(durationMinutes / slotDurationMinutes));

  let endPeriod = startPeriod + periodsToSpan - 1;
  const lastIndex = periodSlots.length - 1;
  if (endPeriod > lastIndex) {
    endPeriod = lastIndex;
  }

  return { startPeriod, endPeriod };
};

const transformEventsForWeek = (
  apiEvents: MonthlyCalendarEvent[],
  weekStart: Date,
  lang: string,
  periodSlots: PeriodSlot[]
): ScheduleEvent[] => {
  const scheduleEvents: ScheduleEvent[] = [];
  const weekEnd = addDays(weekStart, 6);

  apiEvents.forEach((event, index) => {
    // Skip events with missing required fields
    if (!event.day || !event.startTime) {
      return;
    }

    // Parse the event day
    const eventDate = parseISO(event.day);
    const eventDayStart = startOfDay(eventDate);
    const weekStartDay = startOfDay(weekStart);
    const weekEndDay = startOfDay(weekEnd);

    // Check if event falls within current week
    const isInWeek =
      isEqual(eventDayStart, weekStartDay) ||
      isEqual(eventDayStart, weekEndDay) ||
      (isBefore(weekStartDay, eventDayStart) && isBefore(eventDayStart, weekEndDay));

    if (!isInWeek) {
      return;
    }

    // Get day index (0=Saturday, 1=Sunday, etc.)
    const dayIndex = getDayIndexFromDate(eventDate);

    // Get period range from start time and duration
    const { startPeriod, endPeriod } = getEventPeriodRange(
      event.startTime,
      event.duration ?? 0,
      periodSlots
    );

    // Get title based on language
    const title = lang === 'ar' ? event.nameAr : event.nameEn || event.nameAr;

    scheduleEvents.push({
      id: event.id,
      title,
      dayIndex,
      startPeriod,
      endPeriod,
      color: getEventColor(index),
      hasArrow: true,
    });
  });

  return scheduleEvents;
};

/**
 * Color configurations for different types of special columns
 */
const SPECIAL_COLUMN_COLORS = {
  breakfast: {
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-400',
    headerBgColor: 'bg-yellow-50',
    headerBorderColor: 'border-yellow-400',
  },
  break: {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    headerBgColor: 'bg-gray-50',
    headerBorderColor: 'border-gray-200',
  },
  assembly: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-500',
    headerBgColor: 'bg-green-100',
    headerBorderColor: 'border-green-500',
  },
} as const;

const getWorkingDaysFromSchedules = (
  daySchedules: AcademicCalendarEntity['daySchedules']
): number[] => {
  if (!daySchedules || daySchedules.length === 0) {
    // Default working days: Sunday(1) to Thursday(5)
    return [1, 2, 3, 4, 5];
  }

  // Collect all unique days from all day schedules
  const allDays = new Set<number>();
  for (const schedule of daySchedules) {
    if (schedule.days && schedule.days.length > 0) {
      schedule.days.forEach((day) => allDays.add(day));
    }
  }

  // If no days found in schedules, default to Sunday-Thursday
  if (allDays.size === 0) {
    return [1, 2, 3, 4, 5];
  }

  return Array.from(allDays).sort((a, b) => a - b);
};

const getApplicableDays = (scheduleDays: number[], workingDays: number[]): number[] => {
  if (scheduleDays && scheduleDays.length > 0) {
    return [...scheduleDays].sort((a, b) => a - b);
  }

  return workingDays;
};

/**
 * Transform academic calendar timed schedules (breaks, breakfasts, assemblies) into SpecialColumn format
 */
const transformTimedSchedulesToSpecialColumns = (
  schedules: AcademicCalendarTimedSchedule[],
  type: 'breakfast' | 'break' | 'assembly',
  t: (key: string) => string,
  workingDays: number[],
  periodSlots: PeriodSlot[]
): SpecialColumn[] => {
  if (!schedules || schedules.length === 0) {
    return [];
  }

  const colors = SPECIAL_COLUMN_COLORS[type];

  return schedules.map((schedule) => {
    // Parse time to get period index
    const timeParts = schedule.startTime.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const periodIndex = getPeriodIndexFromTime(hours, minutes, periodSlots);

    // Get applicable days for this schedule
    const applicableDays = getApplicableDays(schedule.days, workingDays);

    return {
      columnIndex: periodIndex,
      label: t(`weeklyCalendar.specialColumns.${type}`),
      type: type === 'break' ? 'custom' : type,
      ...colors,
      days: applicableDays, // Use days array for proper non-contiguous support
    } as SpecialColumn;
  });
};

/**
 * Transform all academic calendar data into SpecialColumn array
 * Processes breaks, breakfasts, and assemblies from all calendars for the week
 * Uses daySchedules to determine working days when schedule.days is empty
 */
const transformAcademicCalendarToSpecialColumns = (
  calendars: AcademicCalendarEntity[],
  t: (key: string) => string,
  periodSlots: PeriodSlot[]
): SpecialColumn[] => {
  if (!calendars || calendars.length === 0) {
    return [];
  }

  const allSpecialColumns: SpecialColumn[] = [];
  const usedColumnIndices = new Set<number>();

  for (const calendar of calendars) {
    const workingDays = getWorkingDaysFromSchedules(calendar.daySchedules);

    const breakfastColumns = transformTimedSchedulesToSpecialColumns(
      calendar.breakfasts || [],
      'breakfast',
      t,
      workingDays,
      periodSlots
    );
    for (const col of breakfastColumns) {
      if (!usedColumnIndices.has(col.columnIndex)) {
        allSpecialColumns.push(col);
        usedColumnIndices.add(col.columnIndex);
      }
    }

    const breakColumns = transformTimedSchedulesToSpecialColumns(
      calendar.breaks || [],
      'break',
      t,
      workingDays,
      periodSlots
    );
    for (const col of breakColumns) {
      if (!usedColumnIndices.has(col.columnIndex)) {
        allSpecialColumns.push(col);
        usedColumnIndices.add(col.columnIndex);
      }
    }

    const assemblyColumns = transformTimedSchedulesToSpecialColumns(
      calendar.assemblies || [],
      'assembly',
      t,
      workingDays,
      periodSlots
    );
    for (const col of assemblyColumns) {
      if (!usedColumnIndices.has(col.columnIndex)) {
        allSpecialColumns.push(col);
        usedColumnIndices.add(col.columnIndex);
      }
    }
  }

  return allSpecialColumns.sort((a, b) => a.columnIndex - b.columnIndex);
};

// Dynamic period headers - these can be customized per school
// This configuration would typically come from an API or school settings
// Format a slot's hours/minutes into a localized label like "8:30ص" / "10AM".
const formatSlotTime = (hour: number, min: number, isArabic: boolean): string => {
  const suffix = isArabic ? (hour < 12 ? 'ص' : 'م') : hour < 12 ? 'AM' : 'PM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const minStr = min > 0 ? `:${String(min).padStart(2, '0')}` : '';
  return `${displayHour}${minStr}${suffix}`;
};

const buildPeriodHeaders = (slots: PeriodSlot[], isArabic: boolean): PeriodHeader[] =>
  slots.map((slot) => ({
    label: slot.label,
    time: `${formatSlotTime(slot.startHour, slot.startMin, isArabic)} - ${formatSlotTime(
      slot.endHour,
      slot.endMin,
      isArabic
    )}`,
  }));

// Fallback special columns when no academic calendar data is available
const FALLBACK_SPECIAL_COLUMNS: SpecialColumn[] = [];

// Filter options - education system options now fetched from API

// Export handle type for parent ref access
export type WeeklyCalendarHandle = {
  openAddLesson: () => void;
  recoverLessons: () => void;
};

const WeeklyCalendar = forwardRef<WeeklyCalendarHandle>((_props, ref) => {
  const { t, i18n } = useTranslation();
  const { isArabic } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get current language
  const currentLang = i18n.language;

  // Redux state for lessons and events
  const { lessons: apiLessons, isLoading: isLoadingLessons } = useAppSelector(
    (state) => state.lessons
  );
  const { events: apiEvents, isLoading: isLoadingEvents } = useAppSelector(
    (state) => state.monthlyCalendar
  );

  // Redux state for academic calendar (special columns data)
  const {
    weekCalendarsWithDetails: academicCalendars,
    isLoadingWeekCalendars: isLoadingAcademicCalendars,
  } = useAppSelector((state) => state.academicCalendar);

  // Combined loading state
  const isLoading = isLoadingLessons || isLoadingEvents || isLoadingAcademicCalendars;

  // Filter states — persisted in sessionStorage so they survive a round-trip
  // to the add/edit lesson page without re-prompting the user.
  const FILTERS_STORAGE_KEY = 'weeklyCalendar.filters';
  const persistedFilters = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(FILTERS_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as {
        educationSystem?: string;
        subSystemId?: string;
        stage?: string;
        grade?: string;
      };
    } catch {
      return null;
    }
  }, []);

  const [educationSystem, setEducationSystem] = useState(persistedFilters?.educationSystem ?? '');
  const [subSystemId, setSubSystemId] = useState(persistedFilters?.subSystemId ?? '');
  const [stage, setStage] = useState(persistedFilters?.stage ?? '');
  const [grade, setGrade] = useState(persistedFilters?.grade ?? '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({ educationSystem, subSystemId, stage, grade })
      );
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
  }, [educationSystem, subSystemId, stage, grade]);

  // Redux state for filter data
  const { academicSystems: academicSystemsList, isLoading: isLoadingAcademicSystems } =
    useAppSelector((state) => state.academicSystems);
  const { educationalStages: stagesList, isLoading: isLoadingStages } = useAppSelector(
    (state) => state.educationalStages
  );
  const { classrooms: classroomsList, isLoading: isLoadingClassrooms } = useAppSelector(
    (state) => state.classrooms
  );

  // Current week start date (Saturday)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    () => startOfWeek(new Date(), { weekStartsOn: 6 }) // 6 = Saturday
  );

  // Popup states
  const [selectedLesson, setSelectedLesson] = useState<ScheduleLesson | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [lessonPendingDelete, setLessonPendingDelete] = useState<ScheduleLesson | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extend lesson state
  const [extendingLessonId, setExtendingLessonId] = useState<string | null>(null);
  const [optimisticLessons, setOptimisticLessons] = useState<
    Map<string, { endTime: string; duration: number }>
  >(new Map());

  const userData = tokenManager.getUserData();
  const schoolBranchId = userData?.schoolBrancheId ?? userData?.schoolBranchId ?? undefined;

  useEffect(() => {
    dispatch(
      getAcademicSystems({
        pageIndex: 1,
        pageSize: 10000,
        ...(schoolBranchId && { schoolBranchId }),
      })
    );
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (!educationSystem) return;

    if (subSystemId) {
      dispatch(
        getEducationalStagesBySubSystemId({
          academicSubSystemId: subSystemId,
          params: {
            pageIndex: 1,
            pageSize: 10000,
          },
        })
      );
    } else {
      dispatch(
        getEducationalStages({
          pageIndex: 1,
          pageSize: 10000,
          ...(schoolBranchId && { schoolBranchId }),
        })
      );
    }
  }, [dispatch, educationSystem, subSystemId, schoolBranchId]);

  // Fetch lessons + monthly events only when a classroom is selected
  useEffect(() => {
    if (!grade) return;

    dispatch(
      fetchLessons({
        filters: {
          gradeId: stage || undefined,
          classroomId: grade,
          schoolBranchesId: schoolBranchId,
        },
      })
    );

    dispatch(
      fetchMonthlyCalendarEvents({
        page: 1,
        limit: 100,
        filters: {
          schoolBranchId,
          grade: stage,
        },
      })
    );
  }, [dispatch, grade, stage, schoolBranchId]);

  useEffect(() => {
    if (!educationSystem || !stage) {
      return;
    }

    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          academicSystemId: educationSystem,
          gradeId: stage,
          ...(schoolBranchId && { schoolBranchId }),
        },
      })
    );
  }, [dispatch, educationSystem, stage, schoolBranchId]);

  useEffect(() => {
    if (!schoolBranchId || !stage || !grade) {
      return;
    }

    dispatch(
      fetchAcademicCalendarsForWeek({
        schoolBranchId,
        gradeId: stage,
      })
    );
  }, [dispatch, currentWeekStart, schoolBranchId, stage, grade]);

  // Computed options for filters
  const educationSystemOptions = useMemo(() => {
    return academicSystemsList.map((sys) => ({
      value: sys.id,
      label: isArabic ? sys.nameAr : sys.nameEn,
      subSystems: sys.academicSubSystemDto || [],
    }));
  }, [academicSystemsList, isArabic]);

  const stageOptions = useMemo(() => {
    return stagesList.map((s) => ({
      value: s.id,
      label: isArabic ? s.nameAr : s.nameEn,
    }));
  }, [stagesList, isArabic]);

  const classroomOptions = useMemo(() => {
    return classroomsList.map((c) => ({
      value: c.id,
      label: isArabic ? c.name : c.nameEn || c.name,
    }));
  }, [classroomsList, isArabic]);

  const studyPeriod = useMemo<{ start: Date | null; end: Date | null }>(() => {
    if (!academicCalendars || academicCalendars.length === 0) {
      return { start: null, end: null };
    }
    const calendar = academicCalendars[0];
    return {
      start: calendar.studyStartDate ? new Date(calendar.studyStartDate) : null,
      end: calendar.studyEndDate ? new Date(calendar.studyEndDate) : null,
    };
  }, [academicCalendars]);

  // Period slots are derived from the academic calendar's daySchedules +
  // lessonDuration. When the API returns lessonDuration: 60 the calendar
  // renders 60-min cells; when it returns 45 (or no calendar is loaded yet)
  // we fall back to the historical 45-min default.
  const periodSlots = useMemo<PeriodSlot[]>(() => {
    if (!academicCalendars || academicCalendars.length === 0) {
      return DEFAULT_PERIOD_TIME_SLOTS;
    }
    const calendar = academicCalendars[0];
    const daySchedule = calendar.daySchedules?.[0];
    return buildPeriodSlots(
      daySchedule?.dayStartTime,
      daySchedule?.dayEndTime,
      calendar.lessonDuration
    );
  }, [academicCalendars]);

  const periodHeaders = useMemo<PeriodHeader[]>(
    () => buildPeriodHeaders(periodSlots, isArabic),
    [periodSlots, isArabic]
  );

  const transformedLessons: ScheduleLesson[] = useMemo(() => {
    if (!apiLessons || apiLessons.length === 0) {
      return [];
    }

    const lessons = transformLessonsForWeek(apiLessons, currentWeekStart, currentLang, periodSlots);

    // Apply optimistic updates
    if (optimisticLessons.size > 0) {
      return lessons.map((lesson) => {
        const optimistic = optimisticLessons.get(lesson.id);
        if (optimistic) {
          return {
            ...lesson,
            endTime: optimistic.endTime,
            duration: optimistic.duration,
          };
        }
        return lesson;
      });
    }

    return lessons;
  }, [apiLessons, currentWeekStart, currentLang, optimisticLessons, periodSlots]);

  // Transform API events to ScheduleEvent format for current week
  const transformedEvents: ScheduleEvent[] = useMemo(() => {
    if (!apiEvents || apiEvents.length === 0) {
      return [];
    }

    return transformEventsForWeek(apiEvents, currentWeekStart, currentLang, periodSlots);
  }, [apiEvents, currentWeekStart, currentLang, periodSlots]);

  const specialColumns: SpecialColumn[] = useMemo(() => {
    if (!academicCalendars || academicCalendars.length === 0) {
      return FALLBACK_SPECIAL_COLUMNS;
    }

    const baseColumns = transformAcademicCalendarToSpecialColumns(
      academicCalendars,
      t,
      periodSlots
    );

    if (!studyPeriod.start || !studyPeriod.end) {
      return baseColumns;
    }

    const studyStart = startOfDay(studyPeriod.start);
    const studyEnd = startOfDay(studyPeriod.end);

    const allowedDayIndices: number[] = [];
    for (let dayIdx = 0; dayIdx <= 6; dayIdx++) {
      const dayStart = startOfDay(addDays(currentWeekStart, dayIdx));
      if (!isBefore(dayStart, studyStart) && !isBefore(studyEnd, dayStart)) {
        allowedDayIndices.push(dayIdx);
      }
    }

    return baseColumns
      .map((col) => {
        const sourceDays =
          col.days && col.days.length > 0
            ? col.days
            : Array.from(
                {
                  length: (col.endDayIndex ?? 5) - (col.startDayIndex ?? 1) + 1,
                },
                (_, i) => (col.startDayIndex ?? 1) + i
              );

        const days = sourceDays.filter((d) => allowedDayIndices.includes(d));
        return { ...col, days };
      })
      .filter((col) => (col.days?.length ?? 0) > 0);
  }, [academicCalendars, t, studyPeriod, currentWeekStart, periodSlots]);

  const workingDays = useMemo<number[]>(() => {
    if (!academicCalendars || academicCalendars.length === 0) {
      return [];
    }

    const scheduleDays = new Set<number>();
    for (const calendar of academicCalendars) {
      for (const day of getWorkingDaysFromSchedules(calendar.daySchedules)) {
        scheduleDays.add(day);
      }
    }

    if (!studyPeriod.start || !studyPeriod.end) {
      return Array.from(scheduleDays).sort((a, b) => a - b);
    }

    const studyStart = startOfDay(studyPeriod.start);
    const studyEnd = startOfDay(studyPeriod.end);

    const allowed: number[] = [];
    for (const day of scheduleDays) {
      const dayStart = startOfDay(addDays(currentWeekStart, day));
      if (!isBefore(dayStart, studyStart) && !isBefore(studyEnd, dayStart)) {
        allowed.push(day);
      }
    }

    return allowed.sort((a, b) => a - b);
  }, [academicCalendars, studyPeriod, currentWeekStart]);

  // Handle week change from calendar navigation
  const handleWeekChange = useCallback((weekStart: Date) => {
    setCurrentWeekStart(weekStart);
  }, []);

  const handleEmptyCellClick = (
    dayIndex: number,
    _periodIndex: number,
    startTime: string,
    endTime: string
  ) => {
    // Calculate the actual date for this cell
    const cellDate = addDays(currentWeekStart, dayIndex);

    // Format date in local timezone (YYYY-MM-DD) without UTC conversion
    const year = cellDate.getFullYear();
    const month = (cellDate.getMonth() + 1).toString().padStart(2, '0');
    const day = cellDate.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    navigate(
      `/calendar/weekly/add-lesson?date=${dateStr}&startTime=${startTime}&endTime=${endTime}`,
      {
        state: {
          gradeId: stage || undefined,
          classroomId: grade || undefined,
        },
      }
    );
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    openAddLesson: () => {
      navigate('/calendar/weekly/add-lesson');
    },
    recoverLessons: async () => {
      try {
        await dispatch(recoverAllLessons()).unwrap();
        showToast({
          message: t('weeklyCalendar.lessonsRecoveredSuccessfully'),
          type: 'success',
        });
      } catch (error) {
        const errorMessage =
          typeof error === 'string'
            ? error
            : (error as { message?: string })?.message || t('weeklyCalendar.recoverLessonsFailed');
        showToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });
      }
    },
  }));

  // Handlers for lesson actions
  const handleViewDetails = (lesson: ScheduleLesson) => {
    setSelectedLesson(lesson);
    setDetailsOpen(true);
  };

  const handleEditLesson = (lesson: ScheduleLesson) => {
    navigate(`/calendar/weekly/edit-lesson/${lesson.id}`);
  };

  const handleRequestDelete = (lesson: ScheduleLesson) => {
    setLessonPendingDelete(lesson);
    setShowDeletePopup(true);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setLessonPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!lessonPendingDelete) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteLessonById(lessonPendingDelete.id)).unwrap();

      showToast({
        message: t('weeklyCalendar.lessonDeletedSuccessfully'),
        type: 'success',
      });
      setShowDeletePopup(false);
      setLessonPendingDelete(null);
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');
      showToast({
        message,
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangeDuration = async (lesson: ScheduleLesson, deltaMinutes: number) => {
    const newDuration = lesson.duration + deltaMinutes;

    if (newDuration < 5) {
      return;
    }

    const [hours, minutes] = lesson.endTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + deltaMinutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    const MAX_TIME_MINUTES = 15 * 60 + 15;
    if (totalMinutes > MAX_TIME_MINUTES) {
      showToast({
        message: t('weeklyCalendar.cannotExceedTimeLimit'),
        type: 'error',
      });
      return;
    }

    // 3. Validate End Time > Start Time
    const [startH, startM] = lesson.startTime.split(':').map(Number);
    const startTotalMinutes = startH * 60 + startM;
    if (totalMinutes <= startTotalMinutes) {
      return;
    }
    const newEndTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

    // Set loading state
    setExtendingLessonId(lesson.id);

    // Apply optimistic update immediately
    setOptimisticLessons((prev) => {
      const newMap = new Map(prev);
      newMap.set(lesson.id, { endTime: newEndTime, duration: newDuration });
      return newMap;
    });

    try {
      // Fetch the full lesson data from API (via slice thunk)
      const fullLesson = await dispatch(fetchLessonByIdSilent(lesson.id)).unwrap();

      // Calculcate new key for Backend (it expects end time string)
      const apiNewEndTime = addMinutesToTime(fullLesson.endTime, deltaMinutes);

      // Update the lesson with new end time (via slice thunk)
      await dispatch(
        updateLesson({
          id: fullLesson.id,
          materialId: fullLesson.materialId,
          teacherId: fullLesson.teacherId,
          bookId: fullLesson.bookId,
          gradeId: fullLesson.gradeId,
          classroomId: fullLesson.classroomId,
          schoolBranchesId: fullLesson.schoolBranchesId,
          date: fullLesson.date,
          startTime: fullLesson.startTime,
          endTime: apiNewEndTime,
          classworkFromPage: fullLesson.classworkFromPage,
          classworkToPage: fullLesson.classworkToPage,
          homeworkFromPage: fullLesson.homeworkFromPage,
          homeworkToPage: fullLesson.homeworkToPage,
          homeworkDescriptionAr: fullLesson.homeworkDescriptionAr || '',
          homeworkDescriptionEn: fullLesson.homeworkDescriptionEn || '',
          isHomeworkForAllStudents: fullLesson.isHomeworkForAllStudents,
          lessonsStudent: fullLesson.lessonsStudent.map((s) => ({ studentId: s.studentId })),
          attachments: fullLesson.attachments.map((a) => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
          })),
        })
      ).unwrap();

      showToast({
        message: t('weeklyCalendar.lessonUpdatedSuccessfully'),
        type: 'success',
      });

      // Refresh lessons to get actual data from server
      dispatch(
        fetchLessons({
          filters: {
            gradeId: stage || undefined,
            classroomId: grade || undefined,
            schoolBranchesId: schoolBranchId,
          },
        })
      );

      // Clear optimistic update after refresh
      setOptimisticLessons((prev) => {
        const newMap = new Map(prev);
        newMap.delete(lesson.id);
        return newMap;
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLessons((prev) => {
        const newMap = new Map(prev);
        newMap.delete(lesson.id);
        return newMap;
      });

      const message =
        typeof error === 'string'
          ? error
          : (error as { message?: string })?.message || t('common.error');
      showToast({
        message,
        type: 'error',
        duration: 3000,
      });
    } finally {
      setExtendingLessonId(null);
    }
  };

  const lessonContextActions: LessonContextAction[] = [
    {
      label: t('weeklyCalendar.viewDetails'),
      icon: EyeFillIcon,
      onClick: handleViewDetails,
      color: 'primary',
    },
    {
      label: t('weeklyCalendar.editLesson'),
      icon: EditFilledIcon,
      onClick: handleEditLesson,
      color: 'success',
    },
    {
      label: t('weeklyCalendar.deleteLesson'),
      icon: TrashFillIcon,
      onClick: handleRequestDelete,
      color: 'danger',
    },
  ];

  return (
    <>
      {/* Calendar Component with Filters Inside */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {/* Filters Row - Inside calendar frame, above the calendar */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          {/* Group 1: Education System */}
          <div className="relative inline-flex flex-grow items-center rounded-xl border border-gray-200 bg-white">
            <span className="whitespace-nowrap px-4 py-2.5 text-sm font-normal text-[#646969]">
              {t('weeklyCalendar.filters.educationSystem')}
            </span>
            <div className="h-full border-e border-gray-200" />
            <CustomSelect
              value={educationSystem}
              onChange={(val) => {
                const selectedSystem = academicSystemsList.find((s) => s.id === val);
                setEducationSystem(val as string);
                // Reset dependent filters
                setStage('');
                setGrade('');
                // If the selected system has sub-systems, use the first one to filter stages
                if (selectedSystem?.academicSubSystemDto?.length) {
                  setSubSystemId(selectedSystem.academicSubSystemDto[0].id);
                } else {
                  setSubSystemId('');
                }
              }}
              options={educationSystemOptions}
              placeholder={
                isLoadingAcademicSystems
                  ? t('common.loading')
                  : educationSystem
                    ? educationSystemOptions.find((s) => s.value === educationSystem)?.label || ''
                    : ''
              }
              disabled={isLoadingAcademicSystems}
              variant="ghost"
              showSearch={false}
              className="w-full"
            />
          </div>

          {/* Group 2: Stage Selection */}
          <div className="relative inline-flex flex-grow items-center rounded-xl border border-gray-200 bg-white">
            <span className="whitespace-nowrap px-4 py-2.5 text-sm font-normal text-[#646969]">
              {t('weeklyCalendar.filters.selectStage')}
            </span>
            <div className="h-full border-e border-gray-200" />
            <CustomSelect
              value={stage}
              onChange={(val) => {
                setStage(val as string);
                setGrade('');
              }}
              options={stageOptions}
              placeholder={
                !educationSystem
                  ? t('weeklyCalendar.filters.chooseEducationSystemFirst')
                  : isLoadingStages
                    ? t('common.loading')
                    : stage
                      ? stageOptions.find((s) => s.value === stage)?.label || ''
                      : ''
              }
              disabled={!educationSystem || isLoadingStages}
              variant="ghost"
              showSearch={false}
              className="w-full"
            />
          </div>

          {/* Group 3: Classroom Selection */}
          <div className="relative inline-flex flex-grow items-center rounded-xl border border-gray-200 bg-white">
            <span className="whitespace-nowrap px-4 py-2.5 text-sm font-normal text-[#646969]">
              {t('weeklyCalendar.filters.classroom')}
            </span>
            <div className="h-full border-e border-gray-200" />
            <CustomSelect
              value={grade}
              onChange={(val) => setGrade(val as string)}
              options={classroomOptions}
              placeholder={
                !stage
                  ? t('weeklyCalendar.filters.chooseStageFirst')
                  : isLoadingClassrooms
                    ? t('common.loading')
                    : grade
                      ? classroomOptions.find((c) => c.value === grade)?.label || ''
                      : ''
              }
              disabled={!stage || isLoadingClassrooms}
              variant="ghost"
              showSearch={false}
              className="w-full"
            />
          </div>

          {/* Spacer to push clear button to the end */}
          <div className="" />

          {/* Clear Filters Button - Only show when at least one filter has a value */}
          {(educationSystem || stage || grade) && (
            <button
              onClick={() => {
                setEducationSystem('');
                setSubSystemId('');
                setStage('');
                setGrade('');
              }}
              className="flex h-[40px] items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-100 px-3 text-base font-normal text-green-500 transition-colors hover:bg-green-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              title={t('actions.clearFilter')}
            >
              <img src={CancelXGreenIcon} alt="X" aria-hidden="true" className="h-5 w-5" />
              <span>{t('actions.clearFilter')}</span>
            </button>
          )}
        </div>

        {/* Calendar Content */}
        {!grade ? (
          <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
            <p className="text-base font-medium text-[#0E1F1F]">
              {t('weeklyCalendar.filters.classroom')}
            </p>
            <p className="text-sm text-[#646969]">{t('weeklyCalendar.selectClassroomPrompt')}</p>
          </div>
        ) : isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500"></div>
          </div>
        ) : (
          <WeeklyScheduleCalendar
            lessons={transformedLessons}
            events={transformedEvents}
            periodHeaders={periodHeaders}
            periodSlots={periodSlots}
            specialColumns={specialColumns}
            lessonContextActions={lessonContextActions}
            onLessonClick={handleViewDetails}
            onEmptyCellClick={handleEmptyCellClick}
            onChangeDuration={handleChangeDuration}
            extendingLessonId={extendingLessonId}
            onWeekChange={handleWeekChange}
            weekStart={currentWeekStart}
            workingDays={workingDays}
          />
        )}
      </div>

      {/* Popups */}
      <LessonDetailsPopup
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
      />

      <DeletePopup
        open={showDeletePopup}
        message="weeklyCalendar.confirmDeleteLesson"
        itemName={lessonPendingDelete?.subject ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
});

WeeklyCalendar.displayName = 'WeeklyCalendar';

export default WeeklyCalendar;
