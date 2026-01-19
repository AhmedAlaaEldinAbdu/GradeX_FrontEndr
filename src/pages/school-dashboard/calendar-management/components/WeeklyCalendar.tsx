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
  deleteLessonById,
  recoverAllLessons,
} from '@/redux/features/lessons/lessonsSlice';
import { fetchMonthlyCalendarEvents } from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import { fetchAcademicCalendarsForWeek } from '@/redux/features/academic-calendar/academicCalendarSlice';
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
import { STATIC_SCHOOL_BRANCH_ID } from '@/redux/features/teacher-attendance';

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

  return {
    id: mostRecentLesson.id,
    subject: subjectName,
    teacherName: mostRecentLesson.teacherName,
    startTime: formatTimeDisplay(mostRecentLesson.startTime),
    endTime: formatTimeDisplay(mostRecentLesson.endTime),
    duration: calculateDuration(mostRecentLesson.startTime, mostRecentLesson.endTime),
    dayIndex,
    periodIndex,
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
  startTime: string,
  duration: number
): { startPeriod: number; endPeriod: number } => {
  const startTimeParsed = parseTimeString(startTime.split('T')[1] || startTime);

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
    const { startPeriod, endPeriod } = getEventPeriodRange(event.startTime, event.duration);

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

// Filter options
const educationSystemOptions = [
  { value: 'global', label: 'عالمي' },
  { value: 'national', label: 'وطني' },
];

const systemTypeOptions = [{ value: 'global', label: 'عالمي' }];

const stageOptions = [
  { value: '', label: 'اختر المرحلة' },
  { value: '1', label: 'الأول الأعدادي' },
  { value: '2', label: 'الثاني الأعدادي' },
  { value: '3', label: 'الثالث الأعدادي' },
];

const stageValueOptions = [
  { value: '1', label: 'الأول الأعدادي' },
  { value: '2', label: 'الثاني الأعدادي' },
  { value: '3', label: 'الثالث الأعدادي' },
];

const gradeOptions = [
  { value: '', label: 'الصف الدراسي' },
  { value: '1', label: 'الصف الأول' },
  { value: '2', label: 'الصف الثاني' },
];

const divisionOptions = [
  { value: '1', label: '1/1 ع' },
  { value: '2', label: '1/2 ع' },
  { value: '3', label: '1/3 ع' },
];

// Export handle type for parent ref access
export type WeeklyCalendarHandle = {
  openAddLesson: () => void;
  recoverLessons: () => void;
};

const WeeklyCalendar = forwardRef<WeeklyCalendarHandle>((_props, ref) => {
  const { t, i18n } = useTranslation();
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
  const [systemType, setSystemType] = useState('global');
  const [stage, setStage] = useState('');
  const [stageValue, setStageValue] = useState('1');
  const [grade, setGrade] = useState('');
  const [division, setDivision] = useState('1');

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

  // TODO: Replace with actual school branch ID from user context/auth state
  const schoolBranchId = STATIC_SCHOOL_BRANCH_ID;

  useEffect(() => {
    dispatch(fetchLessons());
    dispatch(fetchMonthlyCalendarEvents({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchAcademicCalendarsForWeek({
        schoolBranchId,
      })
    );
  }, [dispatch, currentWeekStart, schoolBranchId]);

  // Transform API lessons to ScheduleLesson format with weekly repetition
  const transformedLessons: ScheduleLesson[] = useMemo(() => {
    if (!apiLessons || apiLessons.length === 0) {
      return [];
    }

    return transformLessonsForWeek(apiLessons, currentWeekStart, currentLang);
  }, [apiLessons, currentWeekStart, currentLang]);

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

  const handleEmptyCellClick = (dayIndex: number, periodIndex: number) => {
    navigate(`/calendar/weekly/add-lesson?day=${dayIndex}&period=${periodIndex}`);
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
      } catch {
        showToast({
          message: t('weeklyCalendar.recoverLessonsFailed'),
          type: 'error',
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

  // Context menu actions for lessons
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
      {/* Filters Row - matching design order from right to left */}
      <div className="mb-4 flex flex-wrap items-center justify-start gap-3">
        {/* اختر النظام التعليم */}
        <div className="min-w-[160px]">
          <CustomSelect
            value={educationSystem}
            onChange={(val) => setEducationSystem(val as string)}
            options={educationSystemOptions}
            placeholder="اختر النظام التعليم"
          />
        </div>

        {/* عالمي */}
        <div className="min-w-[100px]">
          <CustomSelect
            value={systemType}
            onChange={(val) => setSystemType(val as string)}
            options={systemTypeOptions}
            placeholder="عالمي"
          />
        </div>

        {/* اختر المرحلة */}
        <div className="min-w-[130px]">
          <CustomSelect
            value={stage}
            onChange={(val) => setStage(val as string)}
            options={stageOptions}
            placeholder="اختر المرحلة"
          />
        </div>

        {/* الأول الأعدادي */}
        <div className="min-w-[130px]">
          <CustomSelect
            value={stageValue}
            onChange={(val) => setStageValue(val as string)}
            options={stageValueOptions}
            placeholder="الأول الأعدادي"
          />
        </div>

        {/* الصف الدراسي */}
        <div className="min-w-[120px]">
          <CustomSelect
            value={grade}
            onChange={(val) => setGrade(val as string)}
            options={gradeOptions}
            placeholder="الصف الدراسي"
          />
        </div>

        {/* 1/1 ع */}
        <div className="min-w-[90px]">
          <CustomSelect
            value={division}
            onChange={(val) => setDivision(val as string)}
            options={divisionOptions}
            placeholder="1/1 ع"
          />
        </div>
      </div>

      {/* Calendar Component */}
      <div className="rounded-xl bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500"></div>
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
