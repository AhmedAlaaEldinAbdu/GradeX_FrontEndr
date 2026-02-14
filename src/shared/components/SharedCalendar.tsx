import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import CustomImage from '@/shared/components/CustomImage';
import DotsBlackIcon from '@gradex/assets/icons/DotsBlack.svg';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

const locales = {
  ar: ar,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 6 }), // Saturday
  getDay,
  locales,
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  [key: string]: any;
}

type CalendarEventWithMeta = CalendarEvent & {
  extraEventsCount?: number;
};

export interface ContextMenuAction {
  label: string;
  icon: string;
  onClick: (date?: Date, event?: CalendarEvent) => void;
  color?: 'default' | 'green' | 'success' | 'primary' | 'danger';
  showOnDate?: boolean;
  showOnEvent?: boolean;
  hidden?: (date?: Date, event?: CalendarEvent) => boolean;
}

interface SharedCalendarProps {
  events: CalendarEvent[];
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  contextMenuActions?: ContextMenuAction[];
  defaultView?: keyof typeof Views;
  enableDateCellMenu?: boolean;
  height?: number;
  className?: string;
}

export default function SharedCalendar({
  events,
  onSelectSlot,
  onSelectEvent,
  contextMenuActions = [],
  defaultView = 'month',
  enableDateCellMenu = true,
  height = 700,
  className = '',
}: SharedCalendarProps) {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<keyof typeof Views>(defaultView);
  const [date, setDate] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownContext, setDropdownContext] = useState<{
    type: 'date' | 'event';
    date: Date;
    event?: CalendarEvent;
  } | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language as 'ar' | 'en';
  const isRTL = currentLang === 'ar';

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const getDayKey = useCallback((date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized.toISOString();
  }, []);

  const condensedEvents = useMemo<CalendarEventWithMeta[]>(() => {
    const grouped = events.reduce<Map<string, CalendarEvent[]>>((acc, event) => {
      const key = getDayKey(event.start);
      if (!acc.has(key)) {
        acc.set(key, []);
      }
      acc.get(key)!.push(event);
      return acc;
    }, new Map());

    const condensed: CalendarEventWithMeta[] = [];
    grouped.forEach((group) => {
      const sorted = [...group].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
      const [first, ...rest] = sorted;
      if (!first) {
        return;
      }
      condensed.push({
        ...first,
        extraEventsCount: rest.length,
      });
    });

    return condensed;
  }, [events, getDayKey]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setDropdownContext(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdown]);

  const handleEventClick = useCallback(
    (e: React.MouseEvent, event: CalendarEvent) => {
      e.stopPropagation();
      if (onSelectEvent) {
        onSelectEvent(event);
      }
    },
    [onSelectEvent]
  );

  const CustomCalendarEvent = ({
    event,
    title,
  }: {
    event: CalendarEventWithMeta;
    title?: string;
  }) => (
    <div className="flex items-center justify-center gap-2">
      {typeof event.extraEventsCount === 'number' ? (
        // && event.extraEventsCount > 0
        <span className="line-clamp-2 text-center text-sm font-bold text-green-500">
          +{event.extraEventsCount + 1}
        </span>
      ) : (
        <span className="line-clamp-2 text-center text-xs font-bold text-green-500">{title}</span>
      )}
    </div>
  );

  const eventPropGetter = useCallback(() => {
    return {
      className: 'shared-calendar-event',
    };
  }, []);

  const CustomDateCell = ({ date, event }: { date: Date; event?: CalendarEvent }) => {
    const dateKey = `date-${date.toISOString()}`;
    const isOpen = openDropdown === dateKey;

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (isOpen) {
        setOpenDropdown(null);
        setDropdownContext(null);
        return;
      }
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      const dropdownWidth = 160;
      let top = buttonRect.bottom + 4;
      let left = isRTL ? buttonRect.left : buttonRect.right - dropdownWidth;

      if (containerRect) {
        top = buttonRect.bottom - containerRect.top + 4;
        left = isRTL
          ? buttonRect.left - containerRect.left
          : buttonRect.right - containerRect.left - dropdownWidth;

        const maxLeft = containerRect.width - dropdownWidth - 8;
        const minLeft = 0;
        left = Math.min(Math.max(left, minLeft), maxLeft);
      }

      setDropdownPosition({
        top,
        left,
      });
      setDropdownContext({
        type: 'date',
        date,
        event,
      });
      setOpenDropdown(isOpen ? null : dateKey);
    };

    return (
      <div className="relative flex items-center justify-center">
        <button
          onClick={handleToggle}
          className="relative z-10 rounded p-1 hover:bg-gray-100"
          aria-label="Options"
        >
          <CustomImage
            src={DotsBlackIcon}
            alt="options"
            className="h-4 w-4 opacity-60 hover:opacity-100"
          />
        </button>
      </div>
    );
  };

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-500 hover:bg-green-100';
      case 'success':
        return 'text-lightGreen-500 hover:bg-lightGreen-100';
      case 'primary':
        return 'text-blue-500 hover:bg-blue-100';
      case 'danger':
        return 'text-red-500 hover:bg-red-100';
      default:
        return 'text-gray-500 hover:bg-gray-100';
    }
  };

  const CustomToolbar = ({
    onNavigate,
    label,
  }: {
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE') => void;
    label: string;
  }) => (
    <div className="custom-calendar-toolbar">
      <button
        onClick={() => onNavigate('PREV')}
        className="toolbar-nav-button"
        aria-label="Previous month"
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
      <span className="toolbar-label">{label}</span>
      <button
        onClick={() => onNavigate('NEXT')}
        className="toolbar-nav-button"
        aria-label="Next month"
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
  );

  const CustomWeekdayHeader = (props: { date: Date; label: string }) => {
    const headerDate = new Date(props.date);
    headerDate.setHours(0, 0, 0, 0);

    const isViewingCurrentMonth =
      date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();

    const isTodayWeekdayHeader = isViewingCurrentMonth && getDay(headerDate) === getDay(today);

    return (
      <span className={`weekday-label ${isTodayWeekdayHeader ? 'weekday-label--today' : ''}`}>
        {props.label}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`relative ${className}`}>
        <div className={`calendar-container ${isRTL ? 'rtl' : 'ltr'}`}>
          <BigCalendar
            localizer={localizer}
            events={condensedEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            culture={currentLang}
            rtl={isRTL}
            selectable={!!onSelectSlot}
            onSelectSlot={onSelectSlot}
            onSelectEvent={(event: any, e: React.SyntheticEvent) => {
              if (e && onSelectEvent) {
                handleEventClick(e as React.MouseEvent, event as CalendarEvent);
              }
            }}
            onDrillDown={() => {
              return false;
            }}
            components={{
              toolbar: CustomToolbar,
              event: CustomCalendarEvent,
              month: {
                header: CustomWeekdayHeader as any,
                ...(enableDateCellMenu
                  ? {
                      dateHeader: (props: any) => {
                        const dateEvents = condensedEvents.filter((event) => {
                          const eventDate = new Date(event.start);
                          const cellDate = new Date(props.date);
                          return (
                            eventDate.getDate() === cellDate.getDate() &&
                            eventDate.getMonth() === cellDate.getMonth() &&
                            eventDate.getFullYear() === cellDate.getFullYear()
                          );
                        });

                        return (
                          <div className="relative flex-col">
                            <div className="relative flex items-center justify-between p-1">
                              <span className="px-1 text-sm font-normal text-black-700">
                                {props.label}
                              </span>
                              <CustomDateCell date={props.date} event={dateEvents[0]} />
                            </div>
                          </div>
                        );
                      },
                    }
                  : {}),
              },
            }}
            messages={{
              next: t('common.next'),
              previous: t('common.previous'),
              today: t('common.today'),
              month: t('common.month'),
              week: t('common.week'),
              day: t('common.day'),
            }}
            eventPropGetter={eventPropGetter}
          />
        </div>
      </div>

      {/* Dropdown Menu Portal */}
      {openDropdown && dropdownPosition && dropdownContext && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-max min-w-[7rem] max-w-[10rem] rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenuActions
            .filter((action) => {
              const hasEvent = Boolean(dropdownContext.event);
              const allowDateAction = action.showOnDate !== false;
              const allowEventAction = hasEvent && action.showOnEvent !== false;
              const isHidden =
                action.hidden?.(dropdownContext.date, dropdownContext.event) ?? false;
              return (allowEventAction || allowDateAction) && !isHidden;
            })
            .map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick(dropdownContext.date, dropdownContext.event);
                  setOpenDropdown(null);
                  setDropdownContext(null);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isRTL ? 'text-right' : 'text-left'} ${getColorClass(action.color)}`}
                type="button"
              >
                <CustomImage src={action.icon} alt={action.label} className="h-5 w-5" />
                <span>{action.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
