import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import UpLeftArrow from '@gradex/assets/icons/UpLeftArrow.svg';
import CustomImage from './CustomImage';
import { ARABIC_DAY_NAMES, ENGLISH_DAY_NAMES } from '@/lib/utils/date-utils';
import MenuICon from '@gradex/assets/icons/Menu.svg';

// Types
export interface ScheduleLesson {
  id: string;
  subject: string;
  teacherName: string;
  teacherAvatar?: string;
  startTime: string;
  endTime: string;
  duration: number;
  dayIndex: number; // 0-6 (row index: السبت to الجمعة)
  periodIndex: number; // 0-8 (column index: time slots)
  colSpan?: number; // Number of columns to span (default 1, use 2 for 60+ min lessons)
  color?: 'arabic' | 'math' | 'science' | 'english' | 'default';
}

export interface ScheduleEvent {
  id: string;
  title: string;
  dayIndex: number; // Start row (day)
  endDayIndex?: number; // End row for vertical span (if different from dayIndex)
  startPeriod: number; // Start column
  endPeriod: number; // End column (for horizontal span)
  color?: 'green' | 'orange' | 'blue' | 'teal' | 'yellow';
  hasArrow?: boolean;
}

// Period header configuration
export interface PeriodHeader {
  label: string;
  time: string;
}

// Special column configuration (e.g., فطار, الحديقة)
export interface SpecialColumn {
  columnIndex: number; // Which column (0-8)
  label: string; // Display label (e.g., "الفطار", "الحديقة")
  type: 'breakfast' | 'garden' | 'custom'; // Type for styling
  bgColor?: string; // Custom background color class (e.g., "bg-amber-100")
  textColor?: string; // Custom text color class (e.g., "text-amber-700")
  headerBgColor?: string; // Header background color class
  headerBorderColor?: string; // Header border color class
  startDayIndex?: number; // First day to show colored column (default 1 = الأحد) - used when days array is not provided
  endDayIndex?: number; // Last day to show colored column (default 5 = الخميس) - used when days array is not provided
  days?: number[]; // Specific days to show (takes precedence over startDayIndex/endDayIndex)
}

// Context menu action for lesson actions
export interface LessonContextAction {
  label: string;
  icon?: string;
  onClick: (lesson: ScheduleLesson) => void;
  color?: 'primary' | 'success' | 'danger';
}

interface WeeklyScheduleCalendarProps {
  lessons?: ScheduleLesson[];
  events?: ScheduleEvent[];
  periodHeaders?: PeriodHeader[]; // Customizable period headers
  specialColumns?: SpecialColumn[]; // Dynamic special columns (breakfast, garden, etc.)
  lessonContextActions?: LessonContextAction[]; // Context menu actions for lessons
  onLessonClick?: (lesson: ScheduleLesson) => void;
  onDotsClick?: (lesson: ScheduleLesson, e: React.MouseEvent) => void;
  onDayMenuClick?: (dayIndex: number, e: React.MouseEvent) => void;
  onWeekChange?: (weekStart: Date) => void; // Callback when week changes
  onEmptyCellClick?: (
    dayIndex: number,
    periodIndex: number,
    startTime: string,
    endTime: string
  ) => void; // Callback when clicking empty cell plus icon with time slot
  weekStart?: Date;
  className?: string;
}

const PERIOD_TIME_SLOTS = [
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

// Default special columns (can be overridden via props)
const DEFAULT_SPECIAL_COLUMNS: SpecialColumn[] = [
  {
    columnIndex: 3,
    label: 'الفطار',
    type: 'breakfast',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    headerBgColor: 'bg-amber-50',
    headerBorderColor: 'border-amber-200',
    startDayIndex: 1,
    endDayIndex: 5,
  },
  {
    columnIndex: 5,
    label: 'الحديقة',
    type: 'garden',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    headerBgColor: 'bg-emerald-50',
    headerBorderColor: 'border-emerald-200',
    startDayIndex: 1,
    endDayIndex: 5,
  },
];

export default function WeeklyScheduleCalendar({
  lessons = [],
  events = [],
  specialColumns = DEFAULT_SPECIAL_COLUMNS,
  lessonContextActions = [],
  onLessonClick,
  onDotsClick,
  onEmptyCellClick,
  onWeekChange,
  weekStart: controlledWeekStart,
  className = '',
}: WeeklyScheduleCalendarProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [internalWeek, setInternalWeek] = useState(() => controlledWeekStart ?? new Date());

  const currentWeek = controlledWeekStart ?? internalWeek;

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    lesson: ScheduleLesson | null;
    position: { x: number; y: number };
  }>({ isOpen: false, lesson: null, position: { x: 0, y: 0 } });

  const weekStart = useMemo(() => {
    return startOfWeek(currentWeek, { weekStartsOn: 6 }); // Saturday start
  }, [currentWeek]);

  const dateLocale = isRTL ? ar : enUS;

  // Generate localized period headers
  const localizedPeriodHeaders = useMemo(() => {
    // Format time with localized AM/PM
    const formatTime = (hour: number, min: number) => {
      const suffix = isRTL ? (hour < 12 ? 'ص' : 'م') : hour < 12 ? 'AM' : 'PM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const minStr = min > 0 ? `:${min.toString().padStart(2, '0')}` : '';
      return `${displayHour}${minStr}${suffix}`;
    };

    return PERIOD_TIME_SLOTS.map((slot, idx) => {
      // Check if this period index has a special column with a custom label
      const specialCol = specialColumns.find((sc) => sc.columnIndex === idx);
      // Use special column label if available, otherwise use the period number
      const label = specialCol ? specialCol.label : slot.label;
      const startTime = formatTime(slot.startHour, slot.startMin);
      const endTime = formatTime(slot.endHour, slot.endMin);
      return {
        label,
        time: `${startTime} - ${endTime}`,
      };
    });
  }, [isRTL, specialColumns]);

  const dateRangeLabel = useMemo(() => {
    const weekEnd = addDays(weekStart, 6);
    // Always show both dates with their months based on current language
    const startDate = format(weekStart, 'd MMMM', { locale: dateLocale });
    const endDate = format(weekEnd, 'd MMMM', { locale: dateLocale });
    const year = format(weekEnd, 'yyyy', { locale: dateLocale });

    return `${startDate} - ${endDate} ${year}`;
  }, [weekStart, dateLocale]);

  const handlePrevWeek = () => {
    const newWeek = subWeeks(currentWeek, 1);
    const newWeekStart = startOfWeek(newWeek, { weekStartsOn: 6 });

    if (!controlledWeekStart) {
      setInternalWeek(newWeek);
    }

    onWeekChange?.(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeek = addWeeks(currentWeek, 1);
    const newWeekStart = startOfWeek(newWeek, { weekStartsOn: 6 });

    if (!controlledWeekStart) {
      setInternalWeek(newWeek);
    }

    onWeekChange?.(newWeekStart);
  };

  // Handle context menu open
  const handleContextMenuOpen = (lesson: ScheduleLesson, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({
      isOpen: true,
      lesson,
      position: { x: rect.left, y: rect.bottom + 4 },
    });
  };

  // Handle context menu close
  const handleContextMenuClose = () => {
    setContextMenu({ isOpen: false, lesson: null, position: { x: 0, y: 0 } });
  };

  // Handle context action click
  const handleContextActionClick = (action: LessonContextAction) => {
    if (contextMenu.lesson) {
      action.onClick(contextMenu.lesson);
    }
    handleContextMenuClose();
  };

  // Get lessons for a specific cell (dayIndex = row, periodIndex = column)
  const getLessonsForCell = (dayIndex: number, periodIndex: number) => {
    return lessons.filter((l) => l.dayIndex === dayIndex && l.periodIndex === periodIndex);
  };

  // Check if a cell is covered by a spanning lesson (not the start cell)
  const isLessonSpanCell = (dayIndex: number, periodIndex: number) => {
    return lessons.some((l) => {
      const span = l.colSpan || 1;
      const fullSpan = Math.floor(span); // Only full cells, not including fractional
      return (
        l.dayIndex === dayIndex &&
        periodIndex > l.periodIndex &&
        periodIndex <= l.periodIndex + fullSpan - 1 // Only fully covered cells
      );
    });
  };

  // Check if a lesson starts at this cell
  const getLessonStartingAtCell = (dayIndex: number, periodIndex: number) => {
    return lessons.find((l) => l.dayIndex === dayIndex && l.periodIndex === periodIndex);
  };

  // Check if this cell should show the fractional part of a lesson from previous cells
  const getFractionalLessonForCell = (dayIndex: number, periodIndex: number) => {
    return lessons.find((l) => {
      if (l.dayIndex !== dayIndex) return false;
      const span = l.colSpan || 1;
      const fullCells = Math.floor(span);
      const fractionalPart = span - fullCells;
      // This cell shows the fractional part if it's at periodIndex = lessonStart + fullCells
      return fractionalPart > 0 && periodIndex === l.periodIndex + fullCells;
    });
  };

  // Get event for a specific cell (events can span both horizontally and vertically)
  const getEventForCell = (dayIndex: number, periodIndex: number) => {
    return events.find((e) => {
      const endDay = e.endDayIndex ?? e.dayIndex;
      return (
        dayIndex >= e.dayIndex &&
        dayIndex <= endDay &&
        periodIndex >= e.startPeriod &&
        periodIndex <= e.endPeriod
      );
    });
  };

  const isEventStartCell = (dayIndex: number, periodIndex: number) => {
    return events.some((e) => e.dayIndex === dayIndex && e.startPeriod === periodIndex);
  };

  const getEventColSpan = (event: ScheduleEvent) => {
    return event.endPeriod - event.startPeriod + 1;
  };

  const getEventRowSpan = (event: ScheduleEvent) => {
    const endDay = event.endDayIndex ?? event.dayIndex;
    return endDay - event.dayIndex + 1;
  };

  // Helper to format time as HH:mm
  const formatTime = (hours: number, minutes: number): string => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Get the start and end time for a period
  const getPeriodTimes = (periodIndex: number): { startTime: string; endTime: string } => {
    const slot = PERIOD_TIME_SLOTS[periodIndex];
    if (!slot) {
      return { startTime: '08:30', endTime: '09:15' };
    }
    return {
      startTime: formatTime(slot.startHour, slot.startMin),
      endTime: formatTime(slot.endHour, slot.endMin),
    };
  };

  // Get adjusted start time for a shrinked cell (when a previous lesson extends into this period)
  const getShrinkedCellTimes = (
    periodIndex: number,
    fractionalLesson: ScheduleLesson
  ): { startTime: string; endTime: string } => {
    const slot = PERIOD_TIME_SLOTS[periodIndex];
    if (!slot) {
      return { startTime: '08:30', endTime: '09:15' };
    }

    const span = fractionalLesson.colSpan || 1;
    const fractionalPart = span - Math.floor(span);

    // Calculate how many minutes the fractional part takes from this period
    // Each period is 45 minutes
    const periodDuration = 45;
    const minutesTaken = Math.round(fractionalPart * periodDuration);

    // Calculate adjusted start time
    let adjustedStartMinutes = slot.startHour * 60 + slot.startMin + minutesTaken;
    const adjustedStartHours = Math.floor(adjustedStartMinutes / 60);
    adjustedStartMinutes = adjustedStartMinutes % 60;

    return {
      startTime: formatTime(adjustedStartHours, adjustedStartMinutes),
      endTime: formatTime(slot.endHour, slot.endMin),
    };
  };

  // Three dots menu icon (vertical)
  const DotsIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );

  // Get background color classes for events
  const getEventBgClasses = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-100 text-emerald-700';
      case 'orange':
        return 'bg-amber-100 text-amber-700';
      case 'blue':
        return 'bg-sky-100 text-sky-700';
      case 'teal':
        return 'bg-teal-100 text-teal-700';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Lesson Card matching the design exactly
  const LessonCard = ({ lesson }: { lesson: ScheduleLesson }) => (
    <div
      className="h-full cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
      onClick={() => onLessonClick?.(lesson)}
    >
      {/* Header: Subject + Dots */}
      <div className="flex items-start justify-between gap-1">
        <span className="text-base font-bold text-gray-800">{lesson.subject}</span>
        <button
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            if (lessonContextActions.length > 0) {
              handleContextMenuOpen(lesson, e);
            } else {
              onDotsClick?.(lesson, e);
            }
          }}
        >
          <DotsIcon />
        </button>
      </div>
      {/* Teacher Name */}
      <p className="mt-1.5 text-start text-xs text-gray-500">{lesson.teacherName}</p>
      {/* Time Range */}
      <p className="mt-1 text-start text-xs text-gray-400">
        {lesson.startTime}ص - {lesson.endTime}ص
      </p>
      {/* Duration Badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] text-gray-400">{t('weeklyCalendar.lessonDuration')}</span>
        <span className="text-[11px] text-gray-600">
          <span className="me-1 inline-block rounded border border-gray-200 px-1 py-0.5">
            {lesson.duration}
          </span>
          {t('weeklyCalendar.minutes')}
        </span>
        <div className="ms-auto flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-emerald-600">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
          </svg>
        </div>
      </div>
    </div>
  );

  // Context Menu Component
  const ContextMenu = () => {
    if (!contextMenu.isOpen || !contextMenu.lesson) return null;

    const getActionColorClass = (color?: string) => {
      switch (color) {
        case 'primary':
          return 'text-blue-600 hover:bg-blue-50';
        case 'success':
          return 'text-emerald-600 hover:bg-emerald-50';
        case 'danger':
          return 'text-red-600 hover:bg-red-50';
        default:
          return 'text-gray-700 hover:bg-gray-50';
      }
    };

    return (
      <>
        {/* Backdrop to close menu */}
        <div className="fixed inset-0 z-40" onClick={handleContextMenuClose} />
        {/* Menu */}
        <div
          className="fixed z-50 min-w-[160px] rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
          style={{ top: contextMenu.position.y, left: contextMenu.position.x }}
        >
          {lessonContextActions.map((action, index) => (
            <button
              key={index}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${getActionColorClass(action.color)}`}
              onClick={() => handleContextActionClick(action)}
            >
              {action.icon && <img src={action.icon} alt="" className="h-5 w-5" />}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  };

  // Event Block for colored activity blocks (can span both horizontally and vertically)
  const EventBlock = ({
    event,
    colSpan,
    rowSpan,
  }: {
    event: ScheduleEvent;
    colSpan: number;
    rowSpan: number;
  }) => {
    // For single row events, use simple positioning
    if (rowSpan === 1) {
      const widthPx = colSpan === 1 ? '100%' : `calc(${colSpan * 100}% + ${(colSpan - 1) * 8}px)`;
      return (
        <div
          className={`absolute inset-1 z-20 flex flex-col items-center justify-center rounded-xl ${getEventBgClasses(event.color)}`}
          style={{ width: colSpan > 1 ? widthPx : undefined }}
        >
          {event.hasArrow && (
            <svg
              className="mb-1 h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          )}
          <span className="text-base font-bold">{event.title}</span>
        </div>
      );
    }

    // For multi-row events, we only render content in the start cell
    // The visual spanning is handled by the overlay system
    return null;
  };

  // Get row label (day name with date)
  const getRowLabel = (rowIndex: number) => {
    const dayNames = isRTL ? ARABIC_DAY_NAMES : ENGLISH_DAY_NAMES;
    const dayName = dayNames[rowIndex] || '';
    // Calculate the actual date for this row based on the current week
    const dayDate = addDays(weekStart, rowIndex);
    const dateStr = format(dayDate, 'd/M', { locale: dateLocale });
    return `${dayName} ${dateStr}`;
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-xl bg-white ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Date Navigation Header */}
      <div className="flex items-center justify-center gap-6 border-b border-gray-100 py-4">
        <button
          onClick={handlePrevWeek}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Previous week"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isRTL ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
            />
          </svg>
        </button>
        <span className="text-sm font-semibold text-gray-700">{dateRangeLabel}</span>
        <button
          onClick={handleNextWeek}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Next week"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
            />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto p-4">
        <div className="relative">
          {/* Header Row - Period/Time columns */}
          <div className="relative mb-2 grid grid-cols-[120px_repeat(9,minmax(150px,1fr))] gap-2">
            {/* Row label header - empty space */}
            <div className="flex items-center justify-center" />
            {/* Period headers - 9 columns for time slots */}
            {localizedPeriodHeaders.map((period, idx) => {
              // Check if this column is a special column
              const specialCol = specialColumns.find((sc) => sc.columnIndex === idx);
              const labelClass = specialCol ? 'text-gray-800 font-bold' : 'text-gray-800';

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center rounded-xl border py-4`}
                >
                  <span className={`text-lg font-bold ${labelClass}`}>{period.label}</span>
                  <span className="mt-1 text-[11px] text-gray-400">{period.time}</span>
                </div>
              );
            })}
          </div>

          {/* Day Rows (7 rows for all days of the week) */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
            // Check if this day is today by comparing dates
            const dayDate = addDays(weekStart, dayIndex);
            const today = new Date();
            const isCurrentDay =
              dayDate.getDate() === today.getDate() &&
              dayDate.getMonth() === today.getMonth() &&
              dayDate.getFullYear() === today.getFullYear();

            // Check if this row has a full-row event (spans all columns)
            const fullRowEvent = events.find(
              (e) => e.dayIndex === dayIndex && e.startPeriod === 0 && e.endPeriod === 8
            );

            return (
              <div
                key={dayIndex}
                className="relative mb-2 grid grid-cols-[120px_repeat(9,minmax(150px,1fr))] gap-2 overflow-visible"
              >
                {/* Day label on the right */}
                {isCurrentDay ? (
                  // Current day - green badge with menu icon and border
                  <div className="z-10 flex flex-col items-center justify-center rounded-xl border border-emerald-500 bg-white py-4">
                    <div className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-emerald-500">
                      {/* <MenuIcon /> */}
                      <img src={MenuICon} alt="menu" className="h-4 w-4" />
                      <span className="text-xs font-bold">{getRowLabel(dayIndex)}</span>
                    </div>
                  </div>
                ) : (
                  // Other days - just plain text
                  <div className="z-10 flex items-center justify-center py-3">
                    <span className="text-sm text-gray-500">{getRowLabel(dayIndex)}</span>
                  </div>
                )}
                {/* Period cells (9 columns) */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((periodIndex) => {
                  const cellLessons = getLessonsForCell(dayIndex, periodIndex);
                  const eventAtCell = getEventForCell(dayIndex, periodIndex);
                  const isEventStart = isEventStartCell(dayIndex, periodIndex);
                  const isLessonSpan = isLessonSpanCell(dayIndex, periodIndex);

                  // Find if this column is a special column and if it should be shown for this day
                  const specialCol = specialColumns.find((sc) => {
                    if (sc.columnIndex !== periodIndex) return false;

                    // If days array is provided, check if this day is in the array
                    if (sc.days && sc.days.length > 0) {
                      return sc.days.includes(dayIndex);
                    }

                    // Fall back to startDayIndex/endDayIndex range
                    const startDay = sc.startDayIndex ?? 1;
                    const endDay = sc.endDayIndex ?? 5;
                    return dayIndex >= startDay && dayIndex <= endDay;
                  });

                  // Check if there's a full-row event (these cells should be transparent)
                  const hasFullRowEvent = fullRowEvent !== undefined;

                  // For special columns (breakfast, garden, etc.), use seamless styling
                  // Use negative margin to connect cells vertically
                  // These appear ON TOP of any full-row event
                  if (specialCol) {
                    // Get the applicable days for this special column
                    const applicableDays =
                      specialCol.days && specialCol.days.length > 0
                        ? [...specialCol.days].sort((a, b) => a - b)
                        : Array.from(
                            {
                              length:
                                (specialCol.endDayIndex ?? 5) - (specialCol.startDayIndex ?? 1) + 1,
                            },
                            (_, i) => (specialCol.startDayIndex ?? 1) + i
                          );

                    const dayPositionInList = applicableDays.indexOf(dayIndex);
                    const isFirstRow = dayPositionInList === 0;
                    const isLastRow = dayPositionInList === applicableDays.length - 1;
                    // Calculate middle position for showing label
                    const middlePosition = Math.floor(applicableDays.length / 2);
                    const isMiddleRow = dayPositionInList === middlePosition;

                    // Add padding to compensate for gap, and extend height
                    const marginClass = isFirstRow ? '' : '-mt-2';
                    const paddingClass = isFirstRow ? '' : 'pt-2';
                    const roundedClass = isFirstRow
                      ? 'rounded-t-xl'
                      : isLastRow
                        ? 'rounded-b-xl'
                        : '';

                    return (
                      <div
                        key={periodIndex}
                        className={`flex min-h-[160px] items-center justify-center ${specialCol.bgColor || 'bg-gray-100'} ${roundedClass} ${marginClass} ${paddingClass}`}
                        style={{ marginBottom: isLastRow ? 0 : undefined }}
                      >
                        {isMiddleRow && (
                          <span
                            className={`text-lg font-bold ${specialCol.textColor || 'text-gray-700'}`}
                          >
                            {specialCol.label}
                          </span>
                        )}
                      </div>
                    );
                  }

                  // For rows with full-row events, show cells with event background color
                  // Use negative margin to connect cells horizontally (remove gap)
                  if (hasFullRowEvent) {
                    const marginClass = periodIndex === 0 ? '' : '-me-2 pe-2';

                    // First cell (periodIndex 0) shows the event title and arrow
                    if (periodIndex === 0) {
                      return (
                        <div
                          key={periodIndex}
                          className={`z-10 flex min-h-[160px] items-center gap-2 rounded-s-xl ps-4 ${getEventBgClasses(fullRowEvent.color)}`}
                        >
                          <span className="text-lg font-bold">{fullRowEvent.title}</span>
                          {fullRowEvent.hasArrow && (
                            <CustomImage src={UpLeftArrow} alt="check" className="h-4 w-4" />
                          )}
                        </div>
                      );
                    }
                    // Last cell (periodIndex 8) has rounded left corner
                    if (periodIndex === 8) {
                      return (
                        <div
                          key={periodIndex}
                          className={`z-10 min-h-[160px] rounded-e-xl ${marginClass} ${getEventBgClasses(fullRowEvent.color)}`}
                        />
                      );
                    }
                    // Middle cells - just background color with negative margin
                    return (
                      <div
                        key={periodIndex}
                        className={`z-10 min-h-[160px] ${marginClass} ${getEventBgClasses(fullRowEvent.color)}`}
                      />
                    );
                  }

                  // Get background and border class for regular cells
                  const cellBgClass = 'bg-transparent border border-gray-200';

                  // If part of an event but not starting here, show empty cell with bg
                  if (eventAtCell && !isEventStart) {
                    return (
                      <div
                        key={periodIndex}
                        className={`min-h-[160px] rounded-xl ${cellBgClass}`}
                      />
                    );
                  }

                  if (isLessonSpan) {
                    return (
                      <div
                        key={periodIndex}
                        className="pointer-events-none min-h-[160px]"
                        aria-hidden="true"
                      />
                    );
                  }

                  // Check if a lesson starts at this cell
                  const lessonStartingHere = getLessonStartingAtCell(dayIndex, periodIndex);

                  const fractionalLesson = getFractionalLessonForCell(dayIndex, periodIndex);

                  if (lessonStartingHere && !eventAtCell) {
                    const span = lessonStartingHere.colSpan || 1;
                    const fullCells = Math.floor(span);
                    const fractionalPart = span - fullCells;

                    let widthStyle: string | undefined = undefined;
                    if (span > 1) {
                      const totalCells = fullCells + (fractionalPart > 0 ? fractionalPart : 0);
                      const gapCount = fullCells - 1 + (fractionalPart > 0 ? 1 : 0);
                      widthStyle = `calc(${totalCells * 100}% + ${gapCount * 8}px)`;
                    }

                    return (
                      <div
                        key={periodIndex}
                        className="relative z-10 min-h-[160px]"
                        style={{ width: widthStyle }}
                      >
                        <LessonCard lesson={lessonStartingHere} />
                      </div>
                    );
                  }

                  if (fractionalLesson && !eventAtCell) {
                    const span = fractionalLesson.colSpan || 1;
                    const fractionalPart = span - Math.floor(span);
                    const remainingPart = 1 - fractionalPart;

                    // Get adjusted times for the shrinked cell
                    const { startTime, endTime } = getShrinkedCellTimes(
                      periodIndex,
                      fractionalLesson
                    );

                    return (
                      <div key={periodIndex} className="flex min-h-[160px]" style={{ gap: '8px' }}>
                        <div
                          style={{ width: `${fractionalPart * 100}%` }}
                          className="flex-shrink-0"
                        />
                        <div
                          style={{ width: `calc(${remainingPart * 100}% - 8px)` }}
                          className="group relative flex-shrink-0 cursor-pointer rounded-xl border border-gray-200 bg-transparent transition-colors"
                        >
                          {onEmptyCellClick && (
                            <button
                              onClick={() =>
                                onEmptyCellClick(dayIndex, periodIndex, startTime, endTime)
                              }
                              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-400 transition-all hover:border-emerald-500 hover:text-emerald-500">
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Get times for regular empty cell
                  const { startTime, endTime } = getPeriodTimes(periodIndex);

                  return (
                    <div
                      key={periodIndex}
                      className={`group relative min-h-[160px] overflow-visible rounded-xl ${cellBgClass}`}
                    >
                      {/* Event block (can span horizontally and vertically) */}
                      {eventAtCell && isEventStart && (
                        <EventBlock
                          event={eventAtCell}
                          colSpan={getEventColSpan(eventAtCell)}
                          rowSpan={getEventRowSpan(eventAtCell)}
                        />
                      )}
                      {/* Plus icon for empty cells - shown on hover */}
                      {!eventAtCell && cellLessons.length === 0 && onEmptyCellClick && (
                        <button
                          onClick={() =>
                            onEmptyCellClick(dayIndex, periodIndex, startTime, endTime)
                          }
                          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-400 transition-all hover:border-emerald-500 hover:text-emerald-500">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu />
    </div>
  );
}
