import { forwardRef, useImperativeHandle, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { startOfWeek, addDays, parseISO, startOfDay, isBefore, isEqual } from 'date-fns';
import WeeklyScheduleCalendar, {
  type ScheduleLesson,
  type ScheduleEvent,
  type PeriodHeader,
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
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useLanguage } from '@/hooks/useLanguage';
import { addMinutesToTime } from '@/lib/utils/date-utils';
import { tokenManager } from '@/lib/auth/token-manager';

// Period time slots for mapping API times to periodIndex
// Each slot has start and end times in 24h format (HH:mm)
const PERIOD_TIME_SLOTS = [
  { periodIndex: 0, startHour: 8, startMin: 30, endHour: 9, endMin: 15 },
  { periodIndex: 1, startHour: 9, startMin: 15, endHour: 10, endMin: 0 },
  { periodIndex: 2, startHour: 10, startMin: 0, endHour: 10, endMin: 45 },
  { periodIndex: 3, startHour: 10, startMin: 45, endHour: 11, endMin: 30 },
  { periodIndex: 4, startHour: 11, startMin: 30, endHour: 12, endMin: 15 },
  { periodIndex: 5, startHour: 12, startMin: 15, endHour: 13, endMin: 0 },
  { periodIndex: 6, startHour: 13, startMin: 0, endHour: 13, endMin: 45 },
  { periodIndex: 7, startHour: 13, startMin: 45, endHour: 14, endMin: 30 },
  { periodIndex: 8, startHour: 14, startMin: 30, endHour: 15, endMin: 15 },
];

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
 * Get period index based on time
 * Returns the period index that contains the given time, or -1 if not found
 */
const getPeriodIndexFromTime = (hours: number, minutes: number): number => {
  const timeInMinutes = hours * 60 + minutes;

  for (const slot of PERIOD_TIME_SLOTS) {
    const slotStart = slot.startHour * 60 + slot.startMin;
    const slotEnd = slot.endHour * 60 + slot.endMin;

    if (timeInMinutes >= slotStart && timeInMinutes < slotEnd) {
      return slot.periodIndex;
    }
  }

  // If time is before first slot, return 0
  const firstSlotStart = PERIOD_TIME_SLOTS[0].startHour * 60 + PERIOD_TIME_SLOTS[0].startMin;
  if (timeInMinutes < firstSlotStart) {
    return 0;
  }

  // If time is after last slot, return last index
  return 8;
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
 * Check if date1 is on or before date2 (comparing only date parts, ignoring time)
 */
const isDateOnOrBefore = (date1: Date, date2: Date): boolean => {
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  return isBefore(d1, d2) || isEqual(d1, d2);
};

/**
 * Get the date for a specific day index within a week
 * dayIndex: 0=Saturday, 1=Sunday, ..., 6=Friday
 */
const getDateForDayInWeek = (weekStart: Date, dayIndex: number): Date => {
  return addDays(weekStart, dayIndex);
};

/**
 * Find the applicable lesson for a specific day and period within a week.
 * A lesson applies if:
 * 1. It's on the same day of the week (e.g., both are Sunday)
 * 2. It's on the same time slot (periodIndex)
 * 3. Its date is on or before the current week's day
 * 4. There's no newer lesson for the same day+period that also applies
 */
const findApplicableLessonForSlot = (
  lessons: Lesson[],
  dayIndex: number,
  periodIndex: number,
  weekStart: Date,
  lang: string
): ScheduleLesson | null => {
  // Get the actual date for this day in the current week
  const currentDayDate = getDateForDayInWeek(weekStart, dayIndex);

  // Filter lessons that match this day of week and time slot
  const matchingLessons = lessons.filter((lesson) => {
    const lessonDate = parseISO(lesson.date);
    const lessonDayIndex = getDayIndexFromDate(lessonDate);
    const startTimeParsed = parseTimeString(lesson.startTime);
    const lessonPeriodIndex = getPeriodIndexFromTime(
      startTimeParsed.hours,
      startTimeParsed.minutes
    );

    // Must be same day of week and same period
    if (lessonDayIndex !== dayIndex || lessonPeriodIndex !== periodIndex) {
      return false;
    }

    // Lesson date must be on or before the current day in the week
    // (lesson can only apply from its creation date forward)
    return isDateOnOrBefore(lessonDate, currentDayDate);
  });

  if (matchingLessons.length === 0) {
    return null;
  }

  // Sort by date descending to get the most recent applicable lesson
  matchingLessons.sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // Get the most recent lesson that applies to this slot
  const mostRecentLesson = matchingLessons[0];

  // Get subject name based on language
  const subjectName =
    lang === 'ar'
      ? mostRecentLesson.materialNameAr
      : mostRecentLesson.materialNameEn || mostRecentLesson.materialNameAr;

  // Calculate duration in minutes
  const duration = calculateDuration(mostRecentLesson.startTime, mostRecentLesson.endTime);

  // Calculate exact colSpan based on duration (each period is 45 minutes)
  // Use precise calculation: 45min=1.0, 90min=2.0, 108min=2.4
  const colSpan = Math.max(1, duration / 45);

  // Calculate start offset for lessons not starting at period boundaries
  let startOffset = 0;
  const slot = PERIOD_TIME_SLOTS[periodIndex];

  if (slot) {
    const slotStartMinutes = slot.startHour * 60 + slot.startMin;
    const lessonStartParts = parseTimeString(mostRecentLesson.startTime);
    const lessonStartMinutes = lessonStartParts.hours * 60 + lessonStartParts.minutes;

    const diffMinutes = lessonStartMinutes - slotStartMinutes;
    // Only apply offset if positive and less than period duration (mostly 45 min)
    if (diffMinutes > 0 && diffMinutes < 45) {
      startOffset = diffMinutes / 45;
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
 * Transform all API Lessons to ScheduleLessons for the current week.
 * Lessons repeat weekly until a newer lesson for the same slot is added.
 */
const transformLessonsForWeek = (
  apiLessons: Lesson[],
  weekStart: Date,
  lang: string
): ScheduleLesson[] => {
  const scheduleLessons: ScheduleLesson[] = [];
  const processedSlots = new Set<string>();

  // For each day (0-6) and each period (0-8), find the applicable lesson
  for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
    for (let periodIndex = 0; periodIndex <= 8; periodIndex++) {
      const slotKey = `${dayIndex}-${periodIndex}`;

      // Skip if we've already processed this slot
      if (processedSlots.has(slotKey)) {
        continue;
      }

      const lesson = findApplicableLessonForSlot(
        apiLessons,
        dayIndex,
        periodIndex,
        weekStart,
        lang
      );

      if (lesson) {
        scheduleLessons.push(lesson);
        processedSlots.add(slotKey);
      }
    }
  }

  return scheduleLessons;
};

// Event color options (rotate through them for variety)
const EVENT_COLORS: ScheduleEvent['color'][] = ['green', 'orange', 'blue', 'teal', 'yellow'];

const getEventColor = (index: number): ScheduleEvent['color'] => {
  return EVENT_COLORS[index % EVENT_COLORS.length];
};

const getEventPeriodRange = (
  startTime: string | null | undefined,
  duration: number
): { startPeriod: number; endPeriod: number } => {
  if (!startTime) {
    return { startPeriod: 0, endPeriod: 0 };
  }

  const timeOnly = startTime.includes('T') ? startTime.split('T')[1] : startTime;
  if (!timeOnly) {
    return { startPeriod: 0, endPeriod: 0 };
  }

  const startTimeParsed = parseTimeString(timeOnly);

  const startPeriod = getPeriodIndexFromTime(startTimeParsed.hours, startTimeParsed.minutes);

  const periodsToSpan = Math.max(1, Math.ceil(duration / 0.75)); // 45 min = 0.75 hours per period

  let endPeriod = startPeriod + periodsToSpan - 1;

  // Cap at max period index (8)
  if (endPeriod > 8) {
    endPeriod = 8;
  }

  return { startPeriod, endPeriod };
};

const transformEventsForWeek = (
  apiEvents: MonthlyCalendarEvent[],
  weekStart: Date,
  lang: string
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
    const { startPeriod, endPeriod } = getEventPeriodRange(event.startTime, event.duration ?? 0);

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
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    headerBgColor: 'bg-amber-50',
    headerBorderColor: 'border-amber-200',
  },
  break: {
    bgColor: 'bg-sky-100',
    textColor: 'text-sky-700',
    headerBgColor: 'bg-sky-50',
    headerBorderColor: 'border-sky-200',
  },
  assembly: {
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    headerBgColor: 'bg-emerald-50',
    headerBorderColor: 'border-emerald-200',
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
  workingDays: number[]
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
    const periodIndex = getPeriodIndexFromTime(hours, minutes);

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
  t: (key: string) => string
): SpecialColumn[] => {
  if (!calendars || calendars.length === 0) {
    return [];
  }

  const allSpecialColumns: SpecialColumn[] = [];
  const usedColumnIndices = new Set<number>();

  // Process all calendars (there might be multiple for different stages)
  for (const calendar of calendars) {
    // Get working days from this calendar's daySchedules
    const workingDays = getWorkingDaysFromSchedules(calendar.daySchedules);

    // Process breakfasts
    const breakfastColumns = transformTimedSchedulesToSpecialColumns(
      calendar.breakfasts || [],
      'breakfast',
      t,
      workingDays
    );
    for (const col of breakfastColumns) {
      if (!usedColumnIndices.has(col.columnIndex)) {
        allSpecialColumns.push(col);
        usedColumnIndices.add(col.columnIndex);
      }
    }

    // Process breaks
    const breakColumns = transformTimedSchedulesToSpecialColumns(
      calendar.breaks || [],
      'break',
      t,
      workingDays
    );
    for (const col of breakColumns) {
      if (!usedColumnIndices.has(col.columnIndex)) {
        allSpecialColumns.push(col);
        usedColumnIndices.add(col.columnIndex);
      }
    }

    // Process assemblies
    const assemblyColumns = transformTimedSchedulesToSpecialColumns(
      calendar.assemblies || [],
      'assembly',
      t,
      workingDays
    );
    for (const col of assemblyColumns) {
      if (!usedColumnIndices.has(col.columnIndex)) {
        allSpecialColumns.push(col);
        usedColumnIndices.add(col.columnIndex);
      }
    }
  }

  // Sort by column index for consistent ordering
  return allSpecialColumns.sort((a, b) => a.columnIndex - b.columnIndex);
};

// Dynamic period headers - these can be customized per school
// This configuration would typically come from an API or school settings
const DEFAULT_PERIOD_HEADERS: PeriodHeader[] = [
  { label: '1', time: '8:30ص - 9:15ص' },
  { label: '2', time: '9:15ص - 10ص' },
  { label: '3', time: '10ص - 10:45ص' },
  { label: '4', time: '10:45ص - 11:30ص' },
  { label: '5', time: '11:30ص - 12:15م' },
  { label: '6', time: '12:15م - 1م' },
  { label: '7', time: '1م - 1:45م' },
  { label: '8', time: '1:45م - 2:30م' },
  { label: '9', time: '2:30م - 3:15م' },
];

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

  // Filter states
  const [educationSystem, setEducationSystem] = useState('');
  const [subSystemId, setSubSystemId] = useState('');
  const [stage, setStage] = useState('');
  const [grade, setGrade] = useState('');

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
  }, [dispatch, subSystemId, schoolBranchId]);

  useEffect(() => {
    setStage('');
    setGrade('');
  }, [subSystemId, educationSystem]);

  // Fetch lessons when classroom (grade) or stage changes
  useEffect(() => {
    // Build filters based on selected values
    const filters: { classroomId?: string; gradeId?: string } = {};

    if (stage) {
      filters.gradeId = stage;
    }
    if (grade) {
      filters.classroomId = grade;
    }

    // Fetch lessons with filters (or no filters if nothing selected)
    if (Object.keys(filters).length > 0) {
      dispatch(fetchLessons({ filters: { ...filters, schoolBranchesId: schoolBranchId } }));
    } else {
      dispatch(fetchLessons({ filters: { schoolBranchesId: schoolBranchId } }));
    }

    // Fetch monthly calendar events with schoolBranchId and optional grade filter
    dispatch(
      fetchMonthlyCalendarEvents({
        page: 1,
        limit: 100,
        filters: {
          schoolBranchId,
          grade: stage || undefined,
        },
      })
    );
  }, [dispatch, grade, stage, schoolBranchId]);

  useEffect(() => {
    if (!educationSystem) {
      setGrade('');
      return;
    }

    dispatch(
      fetchClassrooms({
        page: 1,
        limit: 10000,
        filters: {
          academicSystemId: educationSystem,
          ...(stage && { gradeId: stage }),
          ...(schoolBranchId && { schoolBranchId }),
        },
      })
    );
  }, [dispatch, educationSystem, stage, schoolBranchId]);

  useEffect(() => {
    if (!schoolBranchId) {
      return;
    }

    dispatch(
      fetchAcademicCalendarsForWeek({
        schoolBranchId,
      })
    );
  }, [dispatch, currentWeekStart, schoolBranchId]);

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

  // Transform API lessons to ScheduleLesson format with weekly repetition
  const transformedLessons: ScheduleLesson[] = useMemo(() => {
    if (!apiLessons || apiLessons.length === 0) {
      return [];
    }

    const lessons = transformLessonsForWeek(apiLessons, currentWeekStart, currentLang);

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
  }, [apiLessons, currentWeekStart, currentLang, optimisticLessons]);

  // Transform API events to ScheduleEvent format for current week
  const transformedEvents: ScheduleEvent[] = useMemo(() => {
    if (!apiEvents || apiEvents.length === 0) {
      return [];
    }

    return transformEventsForWeek(apiEvents, currentWeekStart, currentLang);
  }, [apiEvents, currentWeekStart, currentLang]);

  // Transform academic calendar data to SpecialColumn format
  const specialColumns: SpecialColumn[] = useMemo(() => {
    if (!academicCalendars || academicCalendars.length === 0) {
      return FALLBACK_SPECIAL_COLUMNS;
    }

    return transformAcademicCalendarToSpecialColumns(academicCalendars, t);
  }, [academicCalendars, t]);

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
      `/calendar/weekly/add-lesson?date=${dateStr}&startTime=${startTime}&endTime=${endTime}`
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
      icon: EditFillIcon,
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
          <div className="relative inline-flex items-center rounded-xl border border-gray-200 bg-white">
            <span className="whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-600">
              {t('weeklyCalendar.filters.educationSystem') || 'اختر النظام التعليم'}
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
              className="min-w-[100px]"
            />
          </div>

          {/* Group 2: Stage Selection */}
          <div className="relative inline-flex items-center rounded-xl border border-gray-200 bg-white">
            <span className="whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-600">
              {t('weeklyCalendar.filters.selectStage') || 'اختر المرحلة'}
            </span>
            <div className="h-full border-e border-gray-200" />
            <CustomSelect
              value={stage}
              onChange={(val) => setStage(val as string)}
              options={stageOptions}
              placeholder={
                isLoadingStages
                  ? t('common.loading')
                  : stage
                    ? stageOptions.find((s) => s.value === stage)?.label || ''
                    : ''
              }
              disabled={isLoadingStages}
              variant="ghost"
              showSearch={false}
              className="min-w-[140px]"
            />
          </div>

          {/* Group 3: Classroom Selection */}
          <div className="relative inline-flex items-center rounded-xl border border-gray-200 bg-white">
            <span className="whitespace-nowrap px-4 py-2.5 text-sm font-medium text-gray-600">
              {t('weeklyCalendar.filters.classroom') || 'الصف الدراسي'}
            </span>
            <div className="h-full border-e border-gray-200" />
            <CustomSelect
              value={grade}
              onChange={(val) => setGrade(val as string)}
              options={classroomOptions}
              placeholder={
                isLoadingClassrooms
                  ? t('common.loading')
                  : grade
                    ? classroomOptions.find((c) => c.value === grade)?.label || ''
                    : ''
              }
              disabled={!educationSystem || isLoadingClassrooms}
              variant="ghost"
              showSearch={false}
              className="min-w-[100px]"
            />
          </div>

          {/* Spacer to push clear button to the end */}
          <div className="flex-1" />

          {/* Clear Filters Button - Only show when at least one filter has a value */}
          {(educationSystem || stage || grade) && (
            <button
              onClick={() => {
                setEducationSystem('');
                setSubSystemId('');
                setStage('');
                setGrade('');
              }}
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
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Calendar Content */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500"></div>
          </div>
        ) : (
          <WeeklyScheduleCalendar
            lessons={transformedLessons}
            events={transformedEvents}
            periodHeaders={DEFAULT_PERIOD_HEADERS}
            specialColumns={specialColumns}
            lessonContextActions={lessonContextActions}
            onLessonClick={handleViewDetails}
            onEmptyCellClick={handleEmptyCellClick}
            onChangeDuration={handleChangeDuration}
            extendingLessonId={extendingLessonId}
            onWeekChange={handleWeekChange}
            weekStart={currentWeekStart}
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
