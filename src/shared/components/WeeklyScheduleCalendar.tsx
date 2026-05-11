import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import UpLeftArrow from '@gradex/assets/icons/UpLeftArrow.svg';
import ArrowLeftSmIcon from '@gradex/assets/icons/ArrowLeftSm.svg';
import ArrowRightSmIcon from '@gradex/assets/icons/ArrowRightSm.svg';
import GreenPlusCircleIcon from '@gradex/assets/icons/GreenPlusCircle.svg';
import ArrowUpGreenIcon from '@gradex/assets/icons/ArrownUpGreen.svg';
import ArrowDownGreenIcon from '@gradex/assets/icons/ArrownDownGreen.svg';
import ActionsDropdown, { type Action as DropdownAction } from './ActionsDropdown';
import CustomImage from './CustomImage';
import { ARABIC_DAY_NAMES, ENGLISH_DAY_NAMES, formatTimeDisplay } from '@/lib/utils/date-utils';
import MenuGreenIcon from '@gradex/assets/icons/MenuGreen.svg';
import DotsIcon from '@gradex/assets/icons/Dots.svg';

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
  startOffset?: number; // Visual offset from the start of the cell (0-1), for lessons starting mid-period
  color?: 'arabic' | 'math' | 'science' | 'english' | 'default';
}

export interface ScheduleEvent {
  id: string;
  title: string;
  dayIndex: number; // Start row (day)
  endDayIndex?: number; // End row for vertical span (if different from dayIndex)
  startPeriod: number; // Start column
  endPeriod: number; // End column (for horizontal span)
  color?: 'green' | 'yellow' | 'default';
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
  onChangeDuration?: (lesson: ScheduleLesson, deltaMinutes: number) => void; // Callback to change duration (+/- minutes)
  extendingLessonId?: string | null; // ID of lesson currently being extended (for loading state)
  weekStart?: Date;
  workingDays?: number[];
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
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-400',
    headerBgColor: 'bg-yellow-100',
    headerBorderColor: 'border-yellow-400',
    startDayIndex: 1,
    endDayIndex: 5,
  },
  {
    columnIndex: 5,
    label: 'الحديقة',
    type: 'garden',
    bgColor: 'bg-green-100',
    textColor: 'text-green-500',
    headerBgColor: 'bg-green-100',
    headerBorderColor: 'border-green-500',
    startDayIndex: 1,
    endDayIndex: 5,
  },
];

export default function WeeklyScheduleCalendar({
  lessons = [],
  events = [],
  specialColumns = DEFAULT_SPECIAL_COLUMNS,
  lessonContextActions = [],
  onDotsClick,
  onEmptyCellClick,
  onChangeDuration,
  extendingLessonId,
  onWeekChange,
  weekStart: controlledWeekStart,
  workingDays,
  className = '',
}: WeeklyScheduleCalendarProps) {
  const isWorkingDay = (dayIndex: number) => {
    if (!workingDays) return true;
    return workingDays.includes(dayIndex);
  };
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const currentLang = i18n.language;
  const [internalWeek, setInternalWeek] = useState(() => controlledWeekStart ?? new Date());

  const currentWeek = controlledWeekStart ?? internalWeek;

  const weekStart = useMemo(() => {
    return startOfWeek(currentWeek, { weekStartsOn: 6 }); // Saturday start
  }, [currentWeek]);

  // Filter out lessons that conflict with special columns (ghost lessons)
  // If a lesson starts in a slot occupied by a special column, it is not rendered,
  // so it should not be considered for spanning logic either.
  const visibleLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      // Check if there is a special column at this lesson's start position
      const isBlockedBySpecialCol = specialColumns.some((sc) => {
        if (sc.columnIndex !== lesson.periodIndex) return false;

        // Check if special column applies to this day
        // Handle potential type mismatch (string vs number) in days array
        if (sc.days && sc.days.length > 0) {
          return sc.days.some((d) => Number(d) === Number(lesson.dayIndex));
        }

        const startDay = sc.startDayIndex ?? 1;
        const endDay = sc.endDayIndex ?? 5;
        return lesson.dayIndex >= startDay && lesson.dayIndex <= endDay;
      });

      return !isBlockedBySpecialCol;
    });
  }, [lessons, specialColumns]);

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

  // Get lessons for a specific cell (dayIndex = row, periodIndex = column)
  const getLessonsForCell = (dayIndex: number, periodIndex: number) => {
    return visibleLessons.filter((l) => l.dayIndex === dayIndex && l.periodIndex === periodIndex);
  };

  // Check if a cell is covered by a spanning lesson (not the start cell)
  const isLessonSpanCell = (dayIndex: number, periodIndex: number) => {
    return visibleLessons.some((l) => {
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
    return visibleLessons.find((l) => l.dayIndex === dayIndex && l.periodIndex === periodIndex);
  };

  // Check if this cell should show the fractional part of a lesson from previous cells
  const getFractionalLessonForCell = (dayIndex: number, periodIndex: number) => {
    return visibleLessons.find((l) => {
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

  const getEventBgClasses = (color?: 'green' | 'yellow' | 'default') => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-500';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Lesson Card matching the design exactly
  const LessonCard = ({ lesson }: { lesson: ScheduleLesson }) => {
    const dropdownActions: DropdownAction[] = lessonContextActions.map((action) => ({
      id: `${lesson.id}-${action.label}`,
      label: action.label,
      icon: action.icon,
      color:
        action.color === 'primary'
          ? 'text-blue-600 hover:bg-blue-50'
          : action.color === 'success'
            ? 'text-green-500 hover:bg-green-50'
            : action.color === 'danger'
              ? 'text-red-500 hover:bg-red-50'
              : 'text-gray-500 hover:bg-gray-50',
      onClick: () => action.onClick(lesson),
    }));

    return (
      <div className="h-full rounded-lg border border-[#DDE0E0] bg-white p-2 transition-shadow hover:shadow-md">
        {/* Header: Subject + Dots */}
        <div className="flex items-start justify-between gap-1">
          <span className="text-xs font-normal text-black-900">{lesson.subject}</span>
          {dropdownActions.length > 0 ? (
            <ActionsDropdown
              actions={dropdownActions}
              triggerClassName="flex h-4 w-4 flex-shrink-0 items-center justify-center"
              iconClassName="h-4 w-4"
              dropdownClassName="absolute z-10 mt-2 min-w-[160px] rounded-lg border border-[#DDE0E0] bg-white py-2 shadow-lg"
            />
          ) : (
            <button
              className="flex h-4 w-4 flex-shrink-0 items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onDotsClick?.(lesson, e);
              }}
              type="button"
            >
              <CustomImage src={DotsIcon} alt="Options" className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Teacher Name */}
        <p className="mt-1 text-start text-[8px] text-[#646969]">{lesson.teacherName}</p>
        {/* Time Range */}
        <p className="mt-0.5 text-start text-[8px] text-[#646969]">
          {formatTimeDisplay(lesson.startTime, currentLang)} -{' '}
          {formatTimeDisplay(lesson.endTime, currentLang)}
        </p>
        {/* Duration Badge - stacked if <=60min, inline if >60min */}
        <div className="mt-2 flex items-start justify-between gap-1">
          {lesson.duration <= 60 ? (
            /* Stacked layout for short lessons */
            <div className="flex flex-col text-start">
              <span className="text-gray-[#646969] text-[8px] font-normal">
                {t('weeklyCalendar.lessonDuration')}
              </span>
              <span className="text-gray-[#646969] text-[8px] font-normal">
                <span className="me-0.5 inline-block rounded-sm border-[0.5px] border-[#A9A7A7] p-0.5 text-[8px]">
                  {lesson.duration}
                </span>
                {t('weeklyCalendar.minutes')}
              </span>
            </div>
          ) : (
            /* Inline layout for longer lessons */
            <div className="flex items-center gap-1 text-start">
              <span className="text-[8px] font-normal text-[#646969]">
                {t('weeklyCalendar.lessonDuration')}
              </span>
              <span className="text-[8px] font-normal text-[#646969]">
                <span className="me-0.5 inline-block rounded-sm border-[0.5px] border-[#A9A7A7] p-0.5 text-[8px]">
                  {lesson.duration}
                </span>
                {t('weeklyCalendar.minutes')}
              </span>
            </div>
          )}
          {extendingLessonId === lesson.id ? (
            <div className="flex h-5 w-5 items-center justify-center rounded border border-green-500 bg-green-50 text-green-500">
              <svg
                className="h-3 w-3 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Up Arrow (Increase Duration) */}
              {(() => {
                // Calculate limits for Increase
                const [endH, endM] = lesson.endTime.split(':').map(Number);
                const currentEndMinutes = endH * 60 + endM;
                const MAX_TIME_MINUTES = 15 * 60 + 15; // 15:15 (3:15 PM)
                const isIncreaseDisabled = currentEndMinutes >= MAX_TIME_MINUTES;

                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isIncreaseDisabled) {
                        onChangeDuration?.(lesson, 5);
                      }
                    }}
                    disabled={isIncreaseDisabled}
                    className={`flex h-3 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded-t-sm border border-b-0 transition-colors ${
                      isIncreaseDisabled
                        ? 'cursor-not-allowed border-green-500 bg-gray-50 text-gray-300'
                        : 'border-green-500 text-green-500 hover:bg-green-50'
                    }`}
                    title={
                      isIncreaseDisabled
                        ? t('weeklyCalendar.cannotExceedTimeLimit')
                        : t('weeklyCalendar.increaseDuration')
                    }
                  >
                    <CustomImage src={ArrowUpGreenIcon} alt="increase" className="h-2 w-2" />
                  </button>
                );
              })()}

              {/* Down Arrow (Decrease Duration) */}
              {(() => {
                // Calculate limits for Decrease
                const isDecreaseDisabled = lesson.duration <= 5;

                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDecreaseDisabled) {
                        onChangeDuration?.(lesson, -5);
                      }
                    }}
                    disabled={isDecreaseDisabled}
                    className={`flex h-3 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded-b-sm border border-t-0 transition-colors ${
                      isDecreaseDisabled
                        ? 'cursor-not-allowed border-green-500 bg-gray-50 text-gray-300'
                        : 'border-green-500 text-green-500 hover:bg-green-50'
                    }`}
                    title={t('weeklyCalendar.decreaseDuration')}
                  >
                    <CustomImage src={ArrowDownGreenIcon} alt="decrease" className="h-2 w-2" />
                  </button>
                );
              })()}
            </div>
          )}
        </div>
      </div>
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
          className={`absolute inset-1 z-20 flex flex-col items-center justify-center rounded-lg ${getEventBgClasses(event.color)}`}
          style={{
            width: colSpan > 1 ? widthPx : undefined,
            backgroundColor:
              event.color === 'yellow'
                ? '#fef3c7'
                : event.color === 'green'
                  ? '#d1fae5'
                  : '#f3f4f6',
          }}
        >
          <div className="flex flex-row-reverse">
            {event.hasArrow && (
              <svg
                className="mx-3 mb-1 inline-block h-5 w-5 rotate-45"
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
      <div className="flex items-center justify-center gap-4 py-3">
        <button
          onClick={handlePrevWeek}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-black-50 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          aria-label="Previous week"
        >
          <CustomImage
            src={isRTL ? ArrowRightSmIcon : ArrowLeftSmIcon}
            alt="Previous week"
            className="h-5 w-5"
          />
        </button>
        <span className="text-xl font-bold text-[#000000]">{dateRangeLabel}</span>
        <button
          onClick={handleNextWeek}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          aria-label="Next week"
        >
          <CustomImage
            src={isRTL ? ArrowLeftSmIcon : ArrowRightSmIcon}
            alt="Next week"
            className="h-5 w-5"
          />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto p-2">
        <div className="relative">
          {/* Header Row - Period/Time columns */}
          <div className="relative mb-2 grid grid-cols-[80px_repeat(9,minmax(90px,1fr))] gap-2">
            {/* Row label header - empty space */}
            <div className="flex items-center justify-center" />
            {/* Period headers - 9 columns for time slots */}
            {localizedPeriodHeaders.map((period, idx) => {
              // Check if this column is a special column
              const specialCol = specialColumns.find((sc) => sc.columnIndex === idx);
              const labelClass = specialCol ? 'font-normal text-[#3A3A3A]' : 'text-[#3A3A3A]';

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-[#DDE0E0] py-2`}
                >
                  <span className={`text-[10px] ${labelClass}`}>{period.label}</span>
                  <span className="mt-0.5 text-[8px] font-normal text-[#646969]">
                    {period.time}
                  </span>
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
                className="relative mb-2 grid grid-cols-[80px_repeat(9,minmax(90px,1fr))] gap-2 overflow-visible"
              >
                {/* Day label on the right */}
                {isCurrentDay ? (
                  // Current day - green badge with menu icon and border
                  <div className="z-10 flex flex-col items-center justify-center rounded-lg border border-green-500 bg-white py-2">
                    <div className="flex items-center gap-1 rounded-xl px-2 py-1 text-green-500">
                      {/* <MenuIcon /> */}
                      <CustomImage src={MenuGreenIcon} alt="menu" className="h-5 w-5" />
                      <span className="text-[10px] font-bold">{getRowLabel(dayIndex)}</span>
                    </div>
                  </div>
                ) : (
                  // Other days - just plain text
                  <div className="z-10 flex items-center justify-center py-2">
                    <span className="text-[10px] font-normal text-[#646969]">
                      {getRowLabel(dayIndex)}
                    </span>
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
                      ? 'rounded-t-lg'
                      : isLastRow
                        ? 'rounded-b-lg'
                        : '';

                    return (
                      <div
                        key={periodIndex}
                        className={`flex min-h-[100px] items-center justify-center ${specialCol.bgColor || 'bg-gray-100'} ${roundedClass} ${marginClass} ${paddingClass}`}
                        style={{ marginBottom: isLastRow ? 0 : undefined }}
                      >
                        {isMiddleRow && (
                          <span
                            className={`text-xs font-bold ${specialCol.textColor || 'text-gray-700'}`}
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
                          className={`z-10 flex min-h-[100px] items-center gap-2 rounded-s-lg ps-3 ${getEventBgClasses(fullRowEvent.color)}`}
                        >
                          <span className="text-sm font-bold">{fullRowEvent.title}</span>
                          {fullRowEvent.hasArrow && (
                            <CustomImage src={UpLeftArrow} alt="check" className="h-3 w-3" />
                          )}
                        </div>
                      );
                    }
                    // Last cell (periodIndex 8) has rounded left corner
                    if (periodIndex === 8) {
                      return (
                        <div
                          key={periodIndex}
                          className={`z-10 min-h-[100px] rounded-e-lg ${marginClass} ${getEventBgClasses(fullRowEvent.color)}`}
                        />
                      );
                    }
                    // Middle cells - just background color with negative margin
                    return (
                      <div
                        key={periodIndex}
                        className={`z-10 min-h-[100px] ${marginClass} ${getEventBgClasses(fullRowEvent.color)}`}
                      />
                    );
                  }

                  // Get background and border class for regular cells
                  const cellBgClass = 'bg-transparent border border-[#DDE0E0]';

                  // If part of an event but not starting here, show empty cell with bg
                  if (eventAtCell && !isEventStart) {
                    return (
                      <div
                        key={periodIndex}
                        className={`min-h-[100px] rounded-lg ${cellBgClass}`}
                      />
                    );
                  }

                  if (isLessonSpan) {
                    return (
                      <div
                        key={periodIndex}
                        className="pointer-events-none min-h-[100px]"
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

                    // If there is a start offset, we need to render the empty space before the lesson as an interactive cell
                    if (lessonStartingHere.startOffset && lessonStartingHere.startOffset > 0) {
                      const offsetPercent = lessonStartingHere.startOffset;

                      // Calculate times for the gap
                      const slot = PERIOD_TIME_SLOTS[periodIndex];
                      let gapStartTime = '00:00';
                      let gapEndTime = '00:00';

                      if (slot) {
                        gapStartTime = formatTime(slot.startHour, slot.startMin);
                        // Gap ends when lesson starts
                        gapEndTime = lessonStartingHere.startTime;
                      }

                      return (
                        <div
                          key={periodIndex}
                          className="flex min-h-[100px]"
                          style={{ gap: '0px' }}
                        >
                          {' '}
                          {/* Zero gap inside the shared cell container */}
                          {/* Empty Gap Slot */}
                          <div
                            style={{ width: `${offsetPercent * 100}%` }}
                            className={`group relative flex-shrink-0 rounded-lg border border-[#DDE0E0] bg-transparent transition-colors ${
                              isWorkingDay(dayIndex) ? 'cursor-pointer hover:border-green-500' : ''
                            }`}
                          >
                            {onEmptyCellClick && isWorkingDay(dayIndex) && (
                              <button
                                onClick={() =>
                                  onEmptyCellClick(dayIndex, periodIndex, gapStartTime, gapEndTime)
                                }
                                className="absolute inset-0 flex items-center justify-center bg-[#5FA8960D] opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <div className="flex h-7 w-7 items-center justify-center">
                                  <CustomImage
                                    src={GreenPlusCircleIcon}
                                    alt="add"
                                    className="h-6 w-6"
                                  />
                                </div>
                              </button>
                            )}
                          </div>
                          {/* Lesson Card */}
                          <div
                            className="relative z-10 flex-shrink-0 p-0.5"
                            style={{
                              width: widthStyle || `${(1 - offsetPercent) * 100}%`,
                              // If span > 1, widthStyle is absolute relative to cell, but we are in flex.
                              // However, widthStyle uses % which is relative to parent.
                              // If parent is the flex container (1 cell wide), 233% width is correct.
                              // But we need to ensure it doesn't shrink.
                            }}
                          >
                            <LessonCard lesson={lessonStartingHere} />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={periodIndex}
                        className="relative z-10 min-h-[100px] p-0.5"
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
                      <div key={periodIndex} className="flex min-h-[100px]" style={{ gap: '4px' }}>
                        <div
                          style={{ width: `${fractionalPart * 100}%` }}
                          className="flex-shrink-0"
                        />
                        <div
                          style={{ width: `calc(${remainingPart * 100}% - 8px)` }}
                          className={`group relative flex-shrink-0 rounded-lg border border-[#DDE0E0] bg-transparent transition-colors ${
                            isWorkingDay(dayIndex) ? 'cursor-pointer hover:border-green-500' : ''
                          }`}
                        >
                          {onEmptyCellClick && isWorkingDay(dayIndex) && (
                            <button
                              onClick={() =>
                                onEmptyCellClick(dayIndex, periodIndex, startTime, endTime)
                              }
                              className="absolute inset-0 flex items-center justify-center bg-[#5FA8960D] opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <div className="flex h-7 w-7 items-center justify-center">
                                <CustomImage
                                  src={GreenPlusCircleIcon}
                                  alt="add"
                                  className="h-6 w-6"
                                />
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
                      className={`group relative min-h-[100px] overflow-visible rounded-lg ${
                        isWorkingDay(dayIndex) ? 'hover:border-green-500' : ''
                      } ${cellBgClass}`}
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
                      {!eventAtCell &&
                        cellLessons.length === 0 &&
                        onEmptyCellClick &&
                        isWorkingDay(dayIndex) && (
                          <button
                            onClick={() =>
                              onEmptyCellClick(dayIndex, periodIndex, startTime, endTime)
                            }
                            className="absolute inset-0 flex items-center justify-center bg-[#5FA8960D] opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <div className="flex h-7 w-7 items-center justify-center">
                              <CustomImage
                                src={GreenPlusCircleIcon}
                                alt="add"
                                className="h-6 w-6"
                              />
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
    </div>
  );
}
