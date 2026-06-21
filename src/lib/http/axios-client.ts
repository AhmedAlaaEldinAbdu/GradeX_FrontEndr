/**
 * Axios HTTP Client
 * Centralized Axios instance with interceptors and error handling
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiResponse } from './types';
import { logger } from '../utils/logger';

// ============================================================================
// Configuration
// ============================================================================

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://gradexpro.runasp.net/api',
  TIMEOUT: 40000,
} as const;

// ============================================================================
// Request Deduplication System (DEV environment only)
// ============================================================================

// Enable deduplication only in DEV environment
const ENABLE_DEDUPLICATION = import.meta.env.DEV;

// Cache to track in-flight GET requests and prevent duplicates
const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Generate unique key for request deduplication
 */
function generateRequestKey(method: string, url: string, params?: unknown, data?: unknown): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  const dataStr = data ? JSON.stringify(data) : '';
  return `${method.toUpperCase()}-${url}-${paramsStr}-${dataStr}`;
}

// ============================================================================
// Create Axios Instance
// ============================================================================

const baseAxiosClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================================================
// Axios Client with Request Deduplication
// ============================================================================

/**
 * Wrapper for axios client that implements request deduplication for GET requests
 * Deduplication is only active in DEV environment
 */
export const axiosClient = new Proxy(baseAxiosClient, {
  get(target, prop: string | symbol) {
    const original = target[prop as keyof typeof target];

    // Only intercept 'get' method for deduplication (and only in DEV)
    if (prop === 'get' && typeof original === 'function' && !ENABLE_DEDUPLICATION) {
      return function (url: string, config?: AxiosRequestConfig) {
        const requestKey = generateRequestKey('GET', url, config?.params, undefined);

        // Check if identical request is in flight
        const pendingRequest = pendingRequests.get(requestKey);
        if (pendingRequest) {
          logger.custom('🔄', `Deduplicating GET request: ${url}`, {
            params: config?.params,
            cacheKey: requestKey,
          });
          return pendingRequest;
        }

        // Make the request and cache the promise
        const requestPromise = (
          original as (url: string, config?: AxiosRequestConfig) => Promise<unknown>
        )
          .apply(target, [url, config])
          .finally(() => {
            // Remove from cache when completed
            pendingRequests.delete(requestKey);
            logger.debug(`Cache cleared for: ${url}`);
          });

        pendingRequests.set(requestKey, requestPromise);
        return requestPromise;
      };
    }

    // Return original property/method for everything else
    return typeof original === 'function' ? original.bind(target) : original;
  },
}) as AxiosInstance;

// ============================================================================
// Request Interceptor
// ============================================================================

baseAxiosClient.interceptors.request.use(
  (config) => {
    // Add request start time for performance tracking
    (config as AxiosRequestConfig & { metadata?: { startTime: number } }).metadata = {
      startTime: Date.now(),
    };

    const token: string | null =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.custom('🔐', `Auth token attached to request: ${config.url}`, {
        hasToken: true,
        tokenPreview: `${token.substring(0, 20)}...`,
      });
    } else {
      logger.warn(`No auth token found for request: ${config.url}`);
    }

    // Add language header
    const language = localStorage.getItem('i18nextLng') || 'en';
    config.headers['Accept-Language'] = language;

    // Add custom headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // Log outgoing request details
    logger.group(`🚀 Outgoing Request: ${config.method?.toUpperCase()} ${config.url}`, () => {
      logger.info('Base URL', config.baseURL);
      logger.info('Full URL', `${config.baseURL}${config.url}`);
      logger.info('Has Authorization', !!config.headers.Authorization);
      logger.info('Language', config.headers['Accept-Language']);

      if (config.params) {
        logger.info('Query Params', config.params);
      }

      if (config.data) {
        logger.info('Request Body', config.data);
      }

      if (config.headers) {
        const sanitizedHeaders = { ...config.headers };
        if (sanitizedHeaders.Authorization) {
          sanitizedHeaders.Authorization = 'Bearer [REDACTED]';
        }
        logger.debug('Headers', sanitizedHeaders);
      }
    });

    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor
// ============================================================================

baseAxiosClient.interceptors.response.use(
  (response) => {
    // Calculate response time if available
    const config = response.config as AxiosRequestConfig & { metadata?: { startTime: number } };
    const duration = config.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : undefined;

    // Log successful response
    logger.group(`📥 Response: ${response.status} ${response.config.url}`, () => {
      logger.success('Status', `${response.status} ${response.statusText}`);

      if (duration) {
        logger.performance('Request Duration', duration);
      }

      if (response.data) {
        // Log response structure without sensitive data
        const responseInfo: Record<string, unknown> = {};

        if (typeof response.data === 'object' && response.data !== null) {
          responseInfo.isSuccess = response.data.isSuccess;
          responseInfo.status = response.data.status;

          if ('value' in response.data) {
            const value = response.data.value;

            // Check if value is null or undefined
            if (!value) {
              responseInfo.hasValue = false;
              responseInfo.valueType = 'null';
            }
            // Check if value is an object (not string, not array, not null)
            else if (typeof value === 'object' && !Array.isArray(value)) {
              responseInfo.hasValue = true;
              responseInfo.valueType = 'object';
              responseInfo.valueKeys = Object.keys(value);

              // Safely check for 'items' property
              if ('items' in value && Array.isArray((value as Record<string, unknown>).items)) {
                responseInfo.itemsCount = (
                  (value as Record<string, unknown>).items as unknown[]
                ).length;
              }
              // Safely check for 'totalItems' property
              if ('totalItems' in value) {
                responseInfo.totalItems = (value as Record<string, unknown>).totalItems;
              }
            }
            // Check if value is a string
            else if (typeof value === 'string') {
              responseInfo.hasValue = true;
              responseInfo.valueType = 'string';
              responseInfo.valueContent = value;
            }
            // Check if value is an array
            else if (Array.isArray(value)) {
              responseInfo.hasValue = true;
              responseInfo.valueType = 'array';
              responseInfo.itemsCount = value.length;
            }
            // Handle other primitive types
            else {
              responseInfo.hasValue = true;
              responseInfo.valueType = typeof value;
              responseInfo.valueContent = value;
            }
          }

          if (response.data.message) {
            responseInfo.message = response.data.message;
          }
          if (response.data.successMessage) {
            responseInfo.successMessage = response.data.successMessage;
          }
        }

        logger.info('Response Data', responseInfo);
        logger.debug('Full Response', response.data);
      }
    });

    return response;
  },
  async (error: AxiosError) => {
    // Log error response with details
    logger.group(`❌ Response Error: ${error.config?.url || 'Unknown URL'}`, () => {
      logger.error('Error Message', error.message);

      if (error.response) {
        logger.error('Status Code', error.response.status);
        logger.error('Status Text', error.response.statusText);
        logger.error('Response Data', error.response.data);
      } else if (error.request) {
        logger.error('Network Error', 'No response received from server');
        logger.debug('Request Details', error.request);
      } else {
        logger.error('Error Details', error.message);
      }

      if (error.config) {
        logger.debug('Failed Request Config', {
          method: error.config.method,
          url: error.config.url,
          params: error.config.params,
        });
      }
    });

    // Handle specific error cases
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401: {
          logger.warn('Unauthorized request - Attempting token refresh', {
            url: error.config?.url,
          });

          // Unauthorized - Try to refresh token
          const originalRequest = error.config;

          if (originalRequest && !originalRequest.headers['X-Retry']) {
            try {
              const refreshToken = localStorage.getItem('refreshToken');

              if (refreshToken) {
                logger.info('Attempting to refresh auth token...');

                // Attempt token refresh
                const response = await axios.post(
                  `${API_CONFIG.BASE_URL}/auth/refresh`,
                  { refreshToken },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );

                const { token } = response.data.data;
                localStorage.setItem('authToken', token);

                logger.success('Token refreshed successfully. Retrying original request...');

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest.headers['X-Retry'] = 'true';

                return axiosClient(originalRequest);
              }
            } catch (refreshError) {
              logger.error('Token refresh failed. Redirecting to login...', refreshError);

              // Refresh failed - clear tokens and redirect to login
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userData');

              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }

          logger.warn(
            'No refresh token available or retry already attempted. Redirecting to login...'
          );

          // No refresh token or retry already attempted
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');

          window.location.href = '/login';
          break;
        }

        case 403:
          logger.error('Access Forbidden - Insufficient permissions', {
            url: error.config?.url,
            data: error.response.data,
          });
          break;

        case 404:
          logger.error('Resource Not Found', {
            url: error.config?.url,
            data: error.response.data,
          });
          break;

        case 422:
          logger.error('Validation Error', {
            url: error.config?.url,
            validationErrors: error.response.data,
          });
          break;

        case 500:
        case 502:
        case 503:
          logger.error('Server Error - Please try again later', {
            status,
            url: error.config?.url,
            data: error.response.data,
          });
          break;

        default:
          logger.error(`HTTP Error ${status}`, {
            message: error.message,
            url: error.config?.url,
            data: error.response.data,
          });
      }
    } else if (error.request) {
      logger.error('Network Error - No response from server', {
        url: error.config?.url,
        message: 'The request was made but no response was received',
      });
    } else {
      logger.error('Request Setup Error', {
        message: error.message,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract error message from Axios error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;

    // Try to get error message from response data
    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      if (typeof data === 'object' && data !== null) {
        if ('message' in data && typeof data.message === 'string') {
          return data.message;
        }
        if ('error' in data && typeof data.error === 'object' && data.error !== null) {
          const errorObj = data.error as Record<string, unknown>;

          // Prefer the most specific message from the validation details, if present
          if (Array.isArray(errorObj.details)) {
            const detailMessage = errorObj.details
              .map((detail) =>
                detail && typeof detail === 'object' && 'message' in detail
                  ? (detail as { message?: unknown }).message
                  : undefined
              )
              .find(
                (message): message is string => typeof message === 'string' && message.length > 0
              );

            if (detailMessage) {
              return detailMessage;
            }
          }

          if ('message' in errorObj && typeof errorObj.message === 'string') {
            return errorObj.message;
          }
        }
      }
    }

    // Fallback to axios error message
    return axiosError.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Check if error is a specific HTTP status code
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  return isErrorStatus(error, 422);
}

/**
 * Check if error is an unauthorized error (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isErrorStatus(error, 401);
}

/**
 * Check if error is a forbidden error (403)
 */
export function isForbiddenError(error: unknown): boolean {
  return isErrorStatus(error, 403);
}

/**
 * Check if error is a not found error (404)
 */
export function isNotFoundError(error: unknown): boolean {
  return isErrorStatus(error, 404);
}

// ============================================================================
// Export
// ============================================================================

export default axiosClient;
export type { AxiosInstance, AxiosRequestConfig, AxiosError };
