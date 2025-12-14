import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DotsIcon from '@gradex/assets/icons/Dots.svg';
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

export interface ContextMenuAction {
  label: string;
  icon: string;
  onClick: (date?: Date, event?: CalendarEvent) => void;
  color?: 'default' | 'success' | 'primary' | 'danger';
  showOnDate?: boolean;
  showOnEvent?: boolean;
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

  const currentLang = i18n.language as 'ar' | 'en';
  const isRTL = currentLang === 'ar';

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
    title,
  }: {
    event: CalendarEvent;
    title?: string;
  }) => (
    <span className="line-clamp-2 text-center text-xs font-semibold text-green-700">
      {title}
    </span>
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
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: isRTL ? rect.left : rect.right - 160,
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
            src={DotsIcon}
            alt="options"
            className="h-4 w-4 opacity-60 hover:opacity-100"
          />
        </button>
      </div>
    );
  };

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'success':
        return 'text-green-600 hover:bg-green-50';
      case 'primary':
        return 'text-blue-600 hover:bg-blue-50';
      case 'danger':
        return 'text-red-600 hover:bg-red-50';
      default:
        return 'text-gray-700 hover:bg-gray-100';
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

  return (
    <Card className={`relative ${className}`}>
      <div className={`calendar-container ${isRTL ? 'rtl' : 'ltr'}`}>
        <BigCalendar
          localizer={localizer}
          events={events}
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
            ...(enableDateCellMenu
              ? {
                  dateHeader: (props: any) => {
                    const dateEvents = events.filter((event) => {
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
                          <span className="px-1 text-sm">{props.label}</span>
                          <CustomDateCell date={props.date} event={dateEvents[0]} />
                        </div>
                      </div>
                    );
                  },
                }
              : {}),
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

      {/* Dropdown Menu Portal */}
      {openDropdown && dropdownPosition && dropdownContext && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] w-max min-w-[7rem] max-w-[10rem] rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          style={{
            top: `${dropdownPosition.top - 10}px`,
            left: `${dropdownPosition.left - 25}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenuActions
            .filter((action) => {
              const hasEvent = Boolean(dropdownContext.event);
              const allowDateAction = action.showOnDate !== false;
              const allowEventAction = hasEvent && action.showOnEvent !== false;
              return allowEventAction || allowDateAction;
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
    </Card>
  );
}
