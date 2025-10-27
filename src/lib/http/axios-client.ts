/**
 * Axios HTTP Client
 * Centralized Axios instance with interceptors and error handling
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiResponse } from './types';

// ============================================================================
// Configuration
// ============================================================================

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
} as const;

// ============================================================================
// Create Axios Instance
// ============================================================================

export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ============================================================================
// Request Interceptor
// ============================================================================

axiosClient.interceptors.request.use(
  (config) => {
    const token: string | null =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token attached to request:', {
        url: config.url,
        hasToken: true,
        tokenPreview: token.substring(0, 30) + '...',
      });
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }

    // Add language header
    const language = localStorage.getItem('i18nextLng') || 'en';
    config.headers['Accept-Language'] = language;

    // Add custom headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        hasAuth: !!config.headers.Authorization,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor
// ============================================================================

axiosClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('📥 Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        url: response.config.url,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('❌ Response Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    // Handle specific error cases
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401: {
          // Unauthorized - Try to refresh token
          const originalRequest = error.config;

          if (originalRequest && !originalRequest.headers['X-Retry']) {
            try {
              const refreshToken = localStorage.getItem('refreshToken');

              if (refreshToken) {
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

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                originalRequest.headers['X-Retry'] = 'true';

                return axiosClient(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed - clear tokens and redirect to login
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userData');

              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }

          // No refresh token or retry already attempted
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');

          window.location.href = '/login';
          break;
        }

        case 403:
          console.error('Access forbidden - Insufficient permissions');
          break;

        case 404:
          console.error('Resource not found');
          break;

        case 422:
          console.error('Validation error:', error.response.data);
          break;

        case 500:
        case 502:
        case 503:
          console.error('Server error - Please try again later');
          break;

        default:
          console.error('An error occurred:', error.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
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
