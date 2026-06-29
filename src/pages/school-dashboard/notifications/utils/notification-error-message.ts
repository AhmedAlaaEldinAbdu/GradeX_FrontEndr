import { formatValidationErrors } from '@/lib/utils/error-utils';
import type { SendSchoolNotificationResponse } from '@/services/api/types/school-notification.types';

type AxiosLikeNotificationError = {
  response?: {
    data?: Partial<SendSchoolNotificationResponse>;
  };
};

export const getNotificationResponseErrorMessage = (
  response: Partial<SendSchoolNotificationResponse>,
  fallbackMessage: string
) =>
  formatValidationErrors(
    response.validationErrors ?? response.errors ?? response.message ?? response.successMessage,
    fallbackMessage
  );

export const getNotificationRequestErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  const responseData = (error as AxiosLikeNotificationError)?.response?.data;

  if (responseData) {
    return getNotificationResponseErrorMessage(responseData, fallbackMessage);
  }

  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) return error.message;

  return fallbackMessage;
};
