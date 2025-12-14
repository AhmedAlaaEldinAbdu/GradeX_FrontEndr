import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import Card from '@/shared/components/Card';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
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

  const currentLang = i18n.language as 'ar' | 'en';
  const isRTL = currentLang === 'ar';

  const handleEventClick = useCallback(
    (e: React.MouseEvent, event: CalendarEvent) => {
      e.stopPropagation();
      if (onSelectEvent) {
        onSelectEvent(event);
      }
    },
    [onSelectEvent]
  );

  const CustomDateCell = ({ date, event }: { date: Date; event?: CalendarEvent }) => {
    const actions: Action[] = contextMenuActions
      .filter((action) => {
        if (event) {
          return action.showOnEvent !== false;
        } else {
          return action.showOnDate !== false;
        }
      })
      .map((action) => ({
        id: action.label,
        label: action.label,
        icon: action.icon,
        color: getColorClass(action.color),
        onClick: () => action.onClick(date, event),
      }));

    return (
      <div className="relative flex items-center justify-center">
        <ActionsDropdown
          actions={actions}
          triggerClassName="relative rounded p-1 hover:bg-gray-100"
          iconClassName="h-4 w-4"
          dropdownClassName={`absolute z-10 mt-0 w-max min-w-[7rem] max-w-[10rem] rounded-lg border border-gray-200 bg-white p-1 shadow-lg`}
        />
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
            // Prevent drill down to day/week view when clicking on dates
            return false;
          }}
          components={{
            toolbar: CustomToolbar,
            ...(enableDateCellMenu
              ? {
                  dateHeader: (props: any) => (
                    <div className="relative flex items-center justify-between p-1">
                      <span className="px-1 text-sm">{props.label}</span>
                      <CustomDateCell date={props.date} />
                    </div>
                  ),
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
        />
      </div>
    </Card>
  );
}
