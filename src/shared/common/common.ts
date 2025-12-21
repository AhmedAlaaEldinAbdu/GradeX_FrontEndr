import { logger } from '@/lib/utils/logger';

export const parseDate = (date?: string): string => {
  return date ? new Date(date).toISOString().split('T')[0] : '';
};

export const formatTime = (time: string | null): string => {
  if (!time) return '-';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
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
