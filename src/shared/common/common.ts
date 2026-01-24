import { logger } from '@/lib/utils/logger';

export const parseDate = (date?: string): string => {
  return date ? new Date(date).toISOString().split('T')[0] : '';
};

export const formatTime = (time: string | null, lang: 'ar' | 'en' = 'en'): string => {
  if (!time) return '-';
  const parts = time.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];

    const isAM = hours < 12;
    const periodAr = isAM ? 'ص' : 'م';
    const periodEn = isAM ? 'AM' : 'PM';

    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours = hours - 12;
    }

    const period = lang === 'ar' ? periodAr : periodEn;
    return `${hours}:${minutes} ${period}`;
  }
  return time;
};

export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export const parseBooleanField = (value?: boolean | string): boolean => {
  return value === 'true' || value === true;
};

export const logFormData = (formData: FormData): void => {
  logger.group('📋 FormData Contents', () => {
    formData.forEach((value, key) => {
      if (value instanceof File) {
        logger.info(`${key}`, `[File: ${value.name}, Size: ${value.size} bytes]`);
      } else {
        logger.info(`${key}`, value);
      }
    });
  });
};
