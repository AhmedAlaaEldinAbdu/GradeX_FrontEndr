/**
 * HTTP Client Exports
 * Main export point for HTTP client utilities
 */

// Primary Axios client
export { default as axiosClient } from './axios-client';

// Error handling utilities
export {
  getErrorMessage,
  isErrorStatus,
  isValidationError,
  isUnauthorizedError,
  isForbiddenError,
  isNotFoundError,
} from './axios-client';

// Backend error-message helpers
export { getBackendMessage, resolveErrorMessage } from './backend-message';

// Axios types
export type { AxiosInstance, AxiosRequestConfig, AxiosError } from './axios-client';

// General types
export * from './types';
