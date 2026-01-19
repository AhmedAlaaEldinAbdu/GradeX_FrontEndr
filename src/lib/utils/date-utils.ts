import { parseISO, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

const getLocale = (lang: string) => (lang === 'ar' ? ar : enUS);

export const formatTimeDisplay = (timeStr: string, lang: string = 'ar'): string => {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);

  const suffix = lang === 'ar' ? (hours < 12 ? 'ص' : 'م') : hours < 12 ? 'AM' : 'PM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${displayHours}${suffix}`;
};

export const formatDateDisplay = (dateStr: string, lang: string = 'ar'): string => {
  const date = parseISO(dateStr);
  const locale = getLocale(lang);
  return format(date, 'd MMMM yyyy', { locale });
};

export const formatDateWithDay = (dateStr: string, lang: string = 'ar'): string => {
  const date = parseISO(dateStr);
  const locale = getLocale(lang);
  return format(date, 'EEEE d MMMM yyyy', { locale });
};

export const formatTimeShort = (timeStr: string): string => {
  const parts = timeStr.split(':');
  return `${parts[0]}:${parts[1]}`;
};

export const calculateDurationMinutes = (startTime: string, endTime: string): number => {
  const startParts = startTime.split(':').map(Number);
  const endParts = endTime.split(':').map(Number);

  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];

  return endMinutes - startMinutes;
};

export const ARABIC_DAY_NAMES = [
  'السبت',
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
];

export const ENGLISH_DAY_NAMES = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];
