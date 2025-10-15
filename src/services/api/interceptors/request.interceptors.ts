/**
 * Request Interceptors
 * Modify requests before they are sent
 */

import type { FetchConfig } from '@/lib/http';
import { tokenManager } from '@/lib/auth';

/**
 * Add authentication token to requests
 */
export const authRequestInterceptor = (config: FetchConfig): FetchConfig => {
  const token = tokenManager.getToken();

  if (token) {
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return config;
};

/**
 * Add common headers to requests
 */
export const commonHeadersInterceptor = (config: FetchConfig): FetchConfig => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'Accept-Language': localStorage.getItem('i18nextLng') || 'en',
      'X-Requested-With': 'XMLHttpRequest',
    },
  };
};

/**
 * Log requests in development mode
 */
export const requestLoggerInterceptor = (config: FetchConfig): FetchConfig => {
  if (import.meta.env.DEV) {
    console.log('🚀 Request:', {
      method: config.method,
      url: config.baseURL,
      headers: config.headers,
      body: config.body,
    });
  }
  return config;
};
