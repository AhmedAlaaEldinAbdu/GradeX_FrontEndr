import { addDays, format, startOfMonth, startOfWeek } from 'date-fns';
import type { MonthlyEventEntity } from '@/services/api/types/monthly-calendar.types';
import type { OfficialHoliday } from '@/services/api/types/official-holidays.types';

export type MonthlyItemTone = 'green' | 'blue' | 'purple' | 'amber';

export type MonthlyCalendarItem = {
  key: string;
  kind: 'event' | 'holiday';
  title: string;
  day: string; // yyyy-MM-dd
  chipLabel: string;
  timeLabel: string;
  locationLabel?: string;
  tone: MonthlyItemTone;
  event?: MonthlyEventEntity;
  leave?: OfficialHoliday;
};

export type MonthlyTypeFilter = 'all' | 'events' | 'holidays';

export const printElement = (element: HTMLElement, title: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('');
  const { dir, lang } = document.documentElement;
  printWindow.document.write(
    `<!doctype html><html dir="${dir}" lang="${lang}"><head><meta charset="utf-8"><title>${title}</title>${styles}<style>@page{size:landscape;margin:12mm}body{background:#fff;padding:16px}</style></head><body>${element.outerHTML}</body></html>`
  );
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

export const TONE_STYLES: Record<
  MonthlyItemTone,
  { chip: string; title: string; label: string; dot: string }
> = {
  green: {
    chip: 'bg-[#ECFDF5] border-[#A7F3D0]/80',
    title: 'text-[#064E3B] text-xs leading-[16.8px]',
    label: 'text-[#047857]',
    dot: 'bg-[#10B981]',
  },
  blue: {
    chip: 'bg-[#F0F9FF] border-[#BAE6FD]',
    title: 'text-[#0C4A6E] text-xs leading-[16.8px]',
    label: 'text-[#0369A1]',
    dot: 'bg-[#0EA5E9]',
  },
  purple: {
    chip: 'bg-[#FAF5FF] border-[#E9D5FF]/80',
    title: 'text-[#581C87] text-xs leading-[16.8px]',
    label: 'text-[#7E22CE]',
    dot: 'bg-[#A855F7]',
  },
  amber: {
    chip: 'bg-[#FFFBEB] border-[#FDE68A]/80',
    title: 'text-[#451A03] text-[10px] leading-[14px]',
    label: 'text-[#B45309]',
    dot: 'bg-[#F59E0B]',
  },
};

const EVENT_TONES: MonthlyItemTone[] = ['green', 'blue', 'purple'];

// Events have no category from the API, so the colour is derived from the id to stay stable.
export const toneForId = (id: string): MonthlyItemTone => {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash + id.charCodeAt(index)) % 997;
  }
  return EVENT_TONES[hash % EVENT_TONES.length];
};

export const MONTHLY_SEARCH_PARAM = 'search';
export const MONTHLY_STAGE_PARAM = 'grade';

export const WEEK_STARTS_ON_SATURDAY = 6;
export const DAYS_IN_GRID = 42;

export const getGridRange = (month: Date) => {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON_SATURDAY });
  return { start, end: addDays(start, DAYS_IN_GRID - 1) };
};

export const toDayKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const fromDayKey = (dayKey: string) => new Date(`${dayKey}T00:00:00`);

// Latin digits keep numbers consistent with the rest of the dashboard in every language.
const intlLocale = (language: string) => `${language}-u-nu-latn`;

export const formatTime = (time: string, language: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(intlLocale(language), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatMonthYear = (date: Date, language: string) =>
  new Intl.DateTimeFormat(intlLocale(language), { month: 'long', year: 'numeric' }).format(date);

export const formatMonthName = (date: Date, language: string) =>
  new Intl.DateTimeFormat(intlLocale(language), { month: 'long' }).format(date);

export const formatWeekday = (date: Date, language: string) =>
  new Intl.DateTimeFormat(intlLocale(language), { weekday: 'long' }).format(date);

export const formatFullDate = (date: Date, language: string) =>
  new Intl.DateTimeFormat(intlLocale(language), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

export const formatDayRange = (start: Date, end: Date, language: string) => {
  if (toDayKey(start) === toDayKey(end)) {
    return `${start.getDate()} ${formatMonthName(start, language)}`;
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} - ${end.getDate()} ${formatMonthName(end, language)}`;
  }
  return `${start.getDate()} ${formatMonthName(start, language)} - ${end.getDate()} ${formatMonthName(end, language)}`;
};
