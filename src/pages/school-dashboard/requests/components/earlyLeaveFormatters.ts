import type { EarlyLeaveRequestDto } from '@/services/api/requests/requests.types';

type Translate = (key: string, options?: Record<string, unknown>) => string;

type TimeParts = {
  hours: number;
  minutes: number;
};

const EMPTY_VALUE = '-';

const normalizeDigits = (value: string) =>
  value
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));

const getTimeCandidate = (value?: string | null) => {
  if (!value) return '';

  const normalized = normalizeDigits(value.trim());
  const timeValue = normalized.includes('T')
    ? (normalized.split('T')[1] ?? normalized)
    : normalized;
  const rangeMatch = timeValue.match(/^(.+?)\s*(?:-|–|—|to|الى|إلى)\s*\d{1,2}/i);

  return (rangeMatch?.[1] ?? timeValue).trim();
};

const getRangeEndCandidate = (value?: string | null) => {
  if (!value) return null;

  const normalized = normalizeDigits(value.trim());
  const timeValue = normalized.includes('T')
    ? (normalized.split('T')[1] ?? normalized)
    : normalized;
  const rangeMatch = timeValue.match(/(?:-|–|—|to|الى|إلى)\s*(.+)$/i);

  return rangeMatch?.[1]?.trim() ?? null;
};

export const parseEarlyLeaveTimeParts = (value?: string | null): TimeParts | null => {
  const timeValue = getTimeCandidate(value);
  if (!timeValue) return null;

  const timeMatch = timeValue.match(
    /^(\d{1,2})(?::(\d{1,2}))?(?::\d{1,2})?\s*(am|pm|a\.m\.|p\.m\.|ص|م|صباحا|صباحًا|مساءا|مساءً)?/i
  );
  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2] ?? 0);
  const period = timeMatch[3]?.toLowerCase();

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes < 0 || minutes > 59) {
    return null;
  }

  if (period) {
    const isPm = /^(pm|p\.m\.|م|مساء)/i.test(period);
    const isAm = /^(am|a\.m\.|ص|صباح)/i.test(period);

    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;
  }

  if (hours < 0 || hours > 23) return null;

  return { hours, minutes };
};

const toMinutes = (parts: TimeParts) => parts.hours * 60 + parts.minutes;

const getDurationFromTimes = (fromValue?: string | null, toValue?: string | null) => {
  const from = parseEarlyLeaveTimeParts(fromValue);
  const to = parseEarlyLeaveTimeParts(toValue);

  if (!from || !to) return null;

  const fromMinutes = toMinutes(from);
  const toMinutesValue = toMinutes(to);

  return toMinutesValue >= fromMinutes
    ? toMinutesValue - fromMinutes
    : toMinutesValue + 24 * 60 - fromMinutes;
};

export const formatEarlyLeaveTime = (value?: string | null, locale = 'en') => {
  const parts = parseEarlyLeaveTimeParts(value);
  if (!value) return EMPTY_VALUE;
  if (!parts) return value;

  const displayHours = parts.hours % 12 || 12;
  const displayMinutes = String(parts.minutes).padStart(2, '0');

  if (locale.startsWith('ar')) {
    return `${displayHours}:${displayMinutes} ${parts.hours >= 12 ? 'مساءا' : 'صباحا'}`;
  }

  return new Intl.DateTimeFormat(locale || 'en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2000, 0, 1, parts.hours, parts.minutes));
};

export const parseEarlyLeaveDurationMinutes = (value?: string | null): number | null => {
  if (!value) return null;

  const normalized = normalizeDigits(value.trim().toLowerCase()).replace(',', '.');
  if (!normalized || normalized === EMPTY_VALUE) return null;

  const timeMatch = normalized.match(/^(\d+):(\d{1,2})(?::\d{1,2})?$/);
  if (timeMatch) {
    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);

    if (Number.isFinite(hours) && Number.isFinite(minutes) && minutes >= 0 && minutes <= 59) {
      return Math.round(hours * 60 + minutes);
    }
  }

  const hourUnit = '(?:h|hr|hrs|hour|hours|heure|heures|stunde|stunden|час|часа|часов|ساعة|ساعات)';
  const minuteUnit = '(?:m|min|mins|minute|minutes|دقيقة|دقيقتين|دقائق|мин|минута|минуты|минут)';
  const hourMatches = normalized.matchAll(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${hourUnit}`, 'gi'));
  const minuteMatches = normalized.matchAll(
    new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${minuteUnit}`, 'gi')
  );

  let totalMinutes = 0;
  let hasUnitMatch = false;
  let hasHourMatch = false;
  let hasMinuteMatch = false;

  for (const match of hourMatches) {
    const hours = Number(match[1]);
    if (Number.isFinite(hours)) {
      totalMinutes += Math.round(hours * 60);
      hasUnitMatch = true;
      hasHourMatch = true;
    }
  }

  for (const match of minuteMatches) {
    const minutes = Number(match[1]);
    if (Number.isFinite(minutes)) {
      totalMinutes += Math.round(minutes);
      hasUnitMatch = true;
      hasMinuteMatch = true;
    }
  }

  if (/ساعتين/.test(normalized)) {
    totalMinutes += 120;
    hasUnitMatch = true;
    hasHourMatch = true;
  } else if (!hasHourMatch && /(^|\s)(ساعة|hour|heure|stunde|час)(\s|$)/i.test(normalized)) {
    totalMinutes += 60;
    hasUnitMatch = true;
    hasHourMatch = true;
  }

  if (/دقيقتين/.test(normalized)) {
    totalMinutes += 2;
    hasUnitMatch = true;
    hasMinuteMatch = true;
  } else if (
    !hasMinuteMatch &&
    /(^|\s)(دقيقة|minute|minutes|минута|минут)(\s|$)/i.test(normalized) &&
    !/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes|دقيقة|دقائق|мин|минута|минуты|минут)/i.test(
      normalized
    )
  ) {
    totalMinutes += 1;
    hasUnitMatch = true;
    hasMinuteMatch = true;
  }

  if (hasUnitMatch) return totalMinutes > 0 ? totalMinutes : null;

  const numericDuration = Number(normalized);
  if (Number.isFinite(numericDuration)) {
    return numericDuration <= 24 ? Math.round(numericDuration * 60) : Math.round(numericDuration);
  }

  return null;
};

const formatDurationUnit = (count: number, unit: 'hour' | 'minute', t: Translate) => {
  const suffix = count === 1 ? 'one' : count === 2 ? 'two' : 'other';
  return t(`requests.earlyLeave.durationUnits.${unit}_${suffix}`, { count });
};

const formatDurationMinutes = (totalMinutes: number, t: Translate) => {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return EMPTY_VALUE;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return t('requests.earlyLeave.durationUnits.separator', {
      hours: formatDurationUnit(hours, 'hour', t),
      minutes: formatDurationUnit(minutes, 'minute', t),
    });
  }

  if (hours > 0) return formatDurationUnit(hours, 'hour', t);
  return formatDurationUnit(minutes, 'minute', t);
};

export const formatEarlyLeaveDuration = (request: EarlyLeaveRequestDto, t: Translate) => {
  const durationMinutes =
    request.durationMinutes ??
    parseEarlyLeaveDurationMinutes(request.duration) ??
    getDurationFromTimes(
      request.fromTime ?? request.time,
      request.toTime ?? getRangeEndCandidate(request.time)
    );

  if (durationMinutes === null) return request.duration || EMPTY_VALUE;

  return formatDurationMinutes(durationMinutes, t);
};
