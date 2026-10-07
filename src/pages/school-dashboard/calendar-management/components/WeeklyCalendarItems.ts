import { addDays, format, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import type { Lesson } from '@/services/api/types/lessons.types';
import type { MonthlyCalendarEvent } from '@/services/api/types/monthly-calendar.types';
import {
  AcademicCalendarTimePeriodScope,
  type AcademicCalendarEntity,
  type AcademicCalendarTimedSchedule,
} from '@/services/api/types/academic-calendar.types';
import SubjectBookEmerald14Icon from '@/assets/icons/SubjectBookEmerald14.svg';
import SubjectTranslatePurple14Icon from '@/assets/icons/SubjectTranslatePurple14.svg';
import SubjectCalculatorBlue14Icon from '@/assets/icons/SubjectCalculatorBlue14.svg';
import SubjectScienceTeal14Icon from '@/assets/icons/SubjectScienceTeal14.svg';
import SubjectGlobeAmber14Icon from '@/assets/icons/SubjectGlobeAmber14.svg';
import SubjectStarYellow14Icon from '@/assets/icons/SubjectStarYellow14.svg';
import SubjectMosqueAmber14Icon from '@/assets/icons/SubjectMosqueAmber14.svg';
import SubjectMosqueAmber12Icon from '@/assets/icons/SubjectMosqueAmber12.svg';
import SubjectMonitorEmerald14Icon from '@/assets/icons/SubjectMonitorEmerald14.svg';
import SubjectMonitorEmerald12Icon from '@/assets/icons/SubjectMonitorEmerald12.svg';
import SubjectArtPink14Icon from '@/assets/icons/SubjectArtPink14.svg';
import SubjectArtPink12Icon from '@/assets/icons/SubjectArtPink12.svg';
import SubjectBoltRose14Icon from '@/assets/icons/SubjectBoltRose14.svg';

export const WEEK_STARTS_ON = 6;
export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];

const DEFAULT_DAY_START = 8 * 60 + 30;
const DEFAULT_LESSON_DURATION = 45;
const DEFAULT_PERIOD_COUNT = 9;

export type TimetableLesson = {
  id: string;
  subject: string;
  teacherName: string;
  date: string;
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  duration: number;
};

export type TimetableEvent = {
  id: string;
  title: string;
  dayIndex: number;
  startMinutes: number;
};

export type ActivityType = 'breakfast' | 'break' | 'assembly';

export type TimetableRow =
  | { kind: 'period'; key: string; start: number; end: number }
  | {
      kind: 'activity';
      key: string;
      start: number;
      end: number;
      type: ActivityType;
      days: number[];
    };

export type SubjectTone = {
  card: string;
  title: string;
  teacher: string;
  icon: string;
  compactIcon: string;
};

const TONES = {
  emerald: {
    card: 'border-[rgba(167,243,208,0.8)] bg-[rgba(236,253,245,0.7)]',
    title: 'text-[#064e3b]',
    teacher: 'text-[#065f46]',
  },
  teal: {
    card: 'border-[rgba(153,246,228,0.8)] bg-[rgba(240,253,250,0.7)]',
    title: 'text-[#134e4a]',
    teacher: 'text-[#115e59]',
  },
  purple: {
    card: 'border-[rgba(233,213,255,0.8)] bg-[rgba(250,245,255,0.7)]',
    title: 'text-[#581c87]',
    teacher: 'text-[#6b21a8]',
  },
  blue: {
    card: 'border-[rgba(191,219,254,0.8)] bg-[rgba(239,246,255,0.7)]',
    title: 'text-[#1e3a8a]',
    teacher: 'text-[#1e40af]',
  },
  amber: {
    card: 'border-[rgba(253,230,138,0.8)] bg-[rgba(255,251,235,0.7)]',
    title: 'text-[#78350f]',
    teacher: 'text-[#92400e]',
  },
  yellow: {
    card: 'border-[rgba(254,240,138,0.8)] bg-[rgba(254,252,232,0.7)]',
    title: 'text-[#713f12]',
    teacher: 'text-[#854d0e]',
  },
  pink: {
    card: 'border-[rgba(251,207,232,0.8)] bg-[rgba(253,242,248,0.7)]',
    title: 'text-[#831843]',
    teacher: 'text-[#9d174d]',
  },
  rose: {
    card: 'border-[rgba(254,205,211,0.8)] bg-[rgba(255,241,242,0.7)]',
    title: 'text-[#881337]',
    teacher: 'text-[#9f1239]',
  },
} as const;

const SUBJECT_TONES = {
  arabic: {
    ...TONES.emerald,
    icon: SubjectBookEmerald14Icon,
    compactIcon: SubjectBookEmerald14Icon,
  },
  english: {
    ...TONES.purple,
    icon: SubjectTranslatePurple14Icon,
    compactIcon: SubjectTranslatePurple14Icon,
  },
  math: {
    ...TONES.blue,
    icon: SubjectCalculatorBlue14Icon,
    compactIcon: SubjectCalculatorBlue14Icon,
  },
  science: { ...TONES.teal, icon: SubjectScienceTeal14Icon, compactIcon: SubjectScienceTeal14Icon },
  social: { ...TONES.amber, icon: SubjectGlobeAmber14Icon, compactIcon: SubjectGlobeAmber14Icon },
  quran: { ...TONES.yellow, icon: SubjectStarYellow14Icon, compactIcon: SubjectStarYellow14Icon },
  islamic: {
    ...TONES.amber,
    icon: SubjectMosqueAmber14Icon,
    compactIcon: SubjectMosqueAmber12Icon,
  },
  digital: {
    ...TONES.emerald,
    icon: SubjectMonitorEmerald14Icon,
    compactIcon: SubjectMonitorEmerald12Icon,
  },
  art: { ...TONES.pink, icon: SubjectArtPink14Icon, compactIcon: SubjectArtPink12Icon },
  sport: { ...TONES.rose, icon: SubjectBoltRose14Icon, compactIcon: SubjectBoltRose14Icon },
} satisfies Record<string, SubjectTone>;

type SubjectKey = keyof typeof SUBJECT_TONES;

const SUBJECT_KEYWORDS: [SubjectKey, string[]][] = [
  ['quran', ['قرآن', 'قران', 'quran', 'koran']],
  ['islamic', ['إسلام', 'اسلام', 'دين', 'islam', 'religio']],
  ['digital', ['رقمي', 'حاسب', 'حاسوب', 'تقني', 'برمج', 'computer', 'digital', ' it', 'ict']],
  ['english', ['انجليز', 'إنجليز', 'english']],
  ['arabic', ['عربي', 'arabic']],
  ['math', ['رياضيات', 'ماث', 'math']],
  ['science', ['علوم', 'فيزياء', 'كيمياء', 'أحياء', 'science', 'physics', 'chemistry', 'biology']],
  ['social', ['اجتماع', 'تاريخ', 'جغرافيا', 'social', 'history', 'geograph']],
  ['art', ['فنية', 'فنون', 'رسم', 'art', 'drawing']],
  ['sport', ['بدنية', 'رياضة', 'physical', 'sport', 'p.e']],
];

const FALLBACK_TONE_KEYS: SubjectKey[] = [
  'arabic',
  'english',
  'math',
  'science',
  'social',
  'art',
  'sport',
  'quran',
];

export const getSubjectTone = (subject: string): SubjectTone => {
  const name = subject.toLowerCase();
  const match = SUBJECT_KEYWORDS.find(([, keywords]) => keywords.some((k) => name.includes(k)));
  if (match) return SUBJECT_TONES[match[0]];

  let hash = 0;
  for (const char of subject) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return SUBJECT_TONES[FALLBACK_TONE_KEYS[hash % FALLBACK_TONE_KEYS.length]];
};

export const parseTimeToMinutes = (time: string | null | undefined): number | null => {
  if (!time) return null;
  const timeOnly = time.includes('T') ? time.split('T')[1] : time;
  const [h, m] = timeOnly.split(':');
  const hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

export const formatMinutes = (total: number): string => {
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const toDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export const getDayIndexFromDate = (date: Date): number => {
  const jsDay = date.getDay();
  return jsDay === 6 ? 0 : jsDay + 1;
};

export const formatWeekRange = (weekStart: Date, lang: string): string => {
  const locale = lang === 'ar' ? ar : enUS;
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const start = sameMonth
    ? format(weekStart, 'd', { locale })
    : format(weekStart, 'd MMMM', { locale });
  return `${start} - ${format(weekEnd, 'd MMMM yyyy', { locale })}`;
};

const mapApiDayToCalendarIndex = (apiDay: number): number => (apiDay === 7 ? 0 : apiDay);

export const getWorkingDaysFromSchedules = (
  daySchedules: AcademicCalendarEntity['daySchedules']
): number[] => {
  const days = new Set<number>();
  for (const schedule of daySchedules ?? []) {
    schedule.days?.forEach((day) => days.add(mapApiDayToCalendarIndex(day)));
  }
  return days.size > 0 ? Array.from(days).sort((a, b) => a - b) : DEFAULT_WORKING_DAYS;
};

type Activity = { type: ActivityType; start: number; end: number; days: number[] };

const collectActivities = (calendars: AcademicCalendarEntity[]): Activity[] => {
  const byKey = new Map<string, Activity>();

  const add = (
    schedules: AcademicCalendarTimedSchedule[] | undefined,
    type: ActivityType,
    workingDays: number[]
  ) => {
    for (const schedule of schedules ?? []) {
      const start = parseTimeToMinutes(schedule.startTime);
      const end = parseTimeToMinutes(schedule.endTime);
      if (start === null || end === null || end <= start) continue;

      const isWholeYear = schedule.timePeriodScope === AcademicCalendarTimePeriodScope.YEAR;
      const days =
        isWholeYear || !schedule.days?.length
          ? workingDays
          : schedule.days.map(mapApiDayToCalendarIndex);

      const key = `${type}|${start}|${end}`;
      const existing = byKey.get(key);
      byKey.set(key, {
        type,
        start,
        end,
        days: Array.from(new Set([...(existing?.days ?? []), ...days])).sort((a, b) => a - b),
      });
    }
  };

  for (const calendar of calendars) {
    const workingDays = getWorkingDaysFromSchedules(calendar.daySchedules);
    add(calendar.breakfasts, 'breakfast', workingDays);
    add(calendar.breaks, 'break', workingDays);
    add(calendar.assemblies, 'assembly', workingDays);
  }

  return Array.from(byKey.values()).sort((a, b) => a.start - b.start);
};

export const buildTimetableRows = (calendars: AcademicCalendarEntity[]): TimetableRow[] => {
  const calendar = calendars[0];
  const daySchedule = calendar?.daySchedules?.[0];
  const dayStart = parseTimeToMinutes(daySchedule?.dayStartTime) ?? DEFAULT_DAY_START;
  const lessonDuration =
    calendar?.lessonDuration && calendar.lessonDuration > 0
      ? calendar.lessonDuration
      : DEFAULT_LESSON_DURATION;
  const parsedEnd = parseTimeToMinutes(daySchedule?.dayEndTime);
  const dayEnd =
    parsedEnd !== null && parsedEnd > dayStart
      ? parsedEnd
      : dayStart + lessonDuration * DEFAULT_PERIOD_COUNT;

  const activities = collectActivities(calendars).filter(
    (a) => a.end > dayStart && a.start < dayEnd
  );

  const rows: TimetableRow[] = [];
  let cursor = dayStart;
  let activityIndex = 0;

  while (cursor < dayEnd) {
    while (activityIndex < activities.length && activities[activityIndex].end <= cursor) {
      activityIndex += 1;
    }
    const next = activities[activityIndex];

    if (next && next.start < cursor + lessonDuration) {
      if (next.start > cursor) {
        rows.push({ kind: 'period', key: `p-${cursor}`, start: cursor, end: next.start });
      }
      const start = Math.max(next.start, cursor);
      rows.push({
        kind: 'activity',
        key: `a-${next.type}-${start}`,
        start,
        end: next.end,
        type: next.type,
        days: next.days,
      });
      cursor = next.end;
      activityIndex += 1;
      continue;
    }

    if (cursor + lessonDuration > dayEnd) break;
    rows.push({ kind: 'period', key: `p-${cursor}`, start: cursor, end: cursor + lessonDuration });
    cursor += lessonDuration;
  }

  return rows;
};

export const findPeriodRowIndex = (rows: TimetableRow[], startMinutes: number): number => {
  const periodIndexes = rows.flatMap((row, idx) => (row.kind === 'period' ? [idx] : []));
  if (periodIndexes.length === 0) return -1;

  const containing = periodIndexes.find(
    (idx) => startMinutes >= rows[idx].start && startMinutes < rows[idx].end
  );
  if (containing !== undefined) return containing;

  const following = periodIndexes.find((idx) => rows[idx].start >= startMinutes);
  return following ?? periodIndexes[periodIndexes.length - 1];
};

export const toTimetableLessons = (
  lessons: Lesson[],
  weekStart: Date,
  lang: string
): TimetableLesson[] => {
  const weekKeys = Array.from({ length: 7 }, (_, i) => toDateKey(addDays(weekStart, i)));

  return lessons.flatMap((lesson) => {
    const dateKey = lesson.date?.split('T')[0];
    const dayIndex = weekKeys.indexOf(dateKey);
    const startMinutes = parseTimeToMinutes(lesson.startTime);
    const endMinutes = parseTimeToMinutes(lesson.endTime);
    if (dayIndex === -1 || startMinutes === null || endMinutes === null) return [];

    return [
      {
        id: lesson.id,
        subject:
          lang === 'ar'
            ? lesson.materialNameAr
            : lesson.materialNameEn || lesson.materialNameAr || '',
        teacherName: lesson.teacherName,
        date: dateKey,
        dayIndex,
        startMinutes,
        endMinutes,
        startTime: formatMinutes(startMinutes),
        endTime: formatMinutes(endMinutes),
        duration: endMinutes - startMinutes,
      },
    ];
  });
};

export const toTimetableEvents = (
  events: MonthlyCalendarEvent[],
  weekStart: Date,
  lang: string
): TimetableEvent[] => {
  const weekKeys = Array.from({ length: 7 }, (_, i) => toDateKey(addDays(weekStart, i)));

  return events.flatMap((event) => {
    if (!event.day) return [];
    const dayIndex = weekKeys.indexOf(toDateKey(parseISO(event.day)));
    const startMinutes = parseTimeToMinutes(event.startTime);
    if (dayIndex === -1 || startMinutes === null) return [];

    return [
      {
        id: event.id,
        title: lang === 'ar' ? event.nameAr : event.nameEn || event.nameAr,
        dayIndex,
        startMinutes,
      },
    ];
  });
};
