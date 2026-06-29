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

const isNotificationResponseError = (
  error: unknown
): error is Partial<SendSchoolNotificationResponse> => {
  if (!error || typeof error !== 'object') return false;

  return (
    'validationErrors' in error ||
    'errors' in error ||
    'message' in error ||
    'successMessage' in error ||
    'isSuccess' in error
  );
};

export const getNotificationErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (isNotificationResponseError(error)) {
    return getNotificationResponseErrorMessage(error, fallbackMessage);
  }

  return getNotificationRequestErrorMessage(error, fallbackMessage);
};
