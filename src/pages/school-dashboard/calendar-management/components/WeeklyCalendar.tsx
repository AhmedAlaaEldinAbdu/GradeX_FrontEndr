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
import { fetchLessons, deleteLessonById } from '@/redux/features/lessons/lessonsSlice';
import { fetchMonthlyCalendarEvents } from '@/redux/features/monthly-calendar/monthlyCalendarSlice';
import type { Lesson } from '@/services/api/types/lessons.types';
import type { MonthlyCalendarEvent } from '@/services/api/types/monthly-calendar.types';
import EyeFillIcon from '@gradex/assets/icons/EyeFill.svg';
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';

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

// Dynamic period headers - these can be customized per school
// This configuration would typically come from an API or school settings
const DEMO_PERIOD_HEADERS: PeriodHeader[] = [
  { label: '1', time: '8:30ص - 9:15ص' },
  { label: '2', time: '9:15ص - 10ص' },
  { label: '3', time: '10ص - 10:45ص' },
  { label: 'فطار', time: '10:45ص - 11:30ص' },
  { label: '5', time: '11:30ص - 12:15م' },
  { label: 'الحديقة', time: '12:15م - 1م' },
  { label: '6', time: '1م - 1:45م' },
  { label: '7', time: '1:45م - 2:30م' },
  { label: '8', time: '2:30م - 3:15م' },
];

// Dynamic special columns - these can be customized per school
// Each school can have different break times, activities, etc.
const DEMO_SPECIAL_COLUMNS: SpecialColumn[] = [
  {
    columnIndex: 3, // Which column (0-8)
    label: 'الفطار', // Display label
    type: 'breakfast',
    bgColor: 'bg-amber-100', // Background color for cells
    textColor: 'text-amber-700', // Text color for label
    headerBgColor: 'bg-amber-50', // Header background
    headerBorderColor: 'border-amber-200', // Header border
    startDayIndex: 1, // Start from الأحد (Sunday)
    endDayIndex: 5, // End at الخميس (Thursday)
  },
  {
    columnIndex: 5, // Which column (0-8)
    label: 'الحديقة', // Display label
    type: 'garden',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    headerBgColor: 'bg-amber-50',
    headerBorderColor: 'border-amber-200',
    startDayIndex: 1,
    endDayIndex: 5,
  },
];

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

  // Combined loading state
  const isLoading = isLoadingLessons || isLoadingEvents;

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

  // Fetch lessons and calendar events when component mounts
  useEffect(() => {
    dispatch(fetchLessons());
    dispatch(fetchMonthlyCalendarEvents({ page: 1, limit: 100 }));
  }, [dispatch]);

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
    recoverLessons: () => {
      // TODO: Implement recover lessons functionality
      console.log('Recover lessons');
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
            periodHeaders={DEMO_PERIOD_HEADERS}
            specialColumns={DEMO_SPECIAL_COLUMNS}
            lessonContextActions={lessonContextActions}
            onLessonClick={handleViewDetails}
            onEmptyCellClick={handleEmptyCellClick}
            onWeekChange={handleWeekChange}
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
