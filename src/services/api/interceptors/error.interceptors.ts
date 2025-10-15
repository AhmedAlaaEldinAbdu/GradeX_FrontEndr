/**
 * Error Interceptors
 * Handle errors and implement retry logic
 */

import type { FetchError } from '@/lib/http';
import { httpClient } from '@/lib/http';
import { tokenManager } from '@/lib/auth';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Handle authentication errors and token refresh
 */
export const authErrorInterceptor = async (error: FetchError): Promise<never> => {
  const { status, config } = error;

  // Handle 401 Unauthorized - Token expired
  if (status === 401 && config) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const newToken = data.data.token;

        tokenManager.setToken(newToken);
        isRefreshing = false;

        onRefreshed(newToken);

        if (config.headers) {
          (config.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }

        return httpClient.request(config.baseURL || '', config) as never;
      } catch {
        isRefreshing = false;
        tokenManager.clearTokens();
        window.location.href = '/login';
        throw error;
      }
    } else {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (config.headers) {
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }
          resolve(httpClient.request(config.baseURL || '', config) as never);
        });
      });
    }
  }

  // Handle 403 Forbidden - Insufficient permissions
  if (status === 403) {
    console.error('Access forbidden:', error);
  }

  // Handle 404 Not Found
  if (status === 404) {
    console.error('Resource not found:', error);
  }

  // Handle 500 Internal Server Error
  if (status === 500) {
    console.error('Server error:', error);
  }

  throw error;
};

/**
 * Log errors in development mode
 */
export const errorLoggerInterceptor = async (error: FetchError): Promise<never> => {
  if (import.meta.env.DEV) {
    console.error('❌ Error:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      data: error.data,
    });
  }
  throw error;
};
