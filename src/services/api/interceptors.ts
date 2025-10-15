/**
 * API Interceptors
 * Request and response interceptors for authentication, error handling, etc.
 */

import type { FetchConfig, FetchError } from '@/lib/fetch';
import { httpClient } from '@/lib/fetch';

// ============================================================================
// Token Management
// ============================================================================

const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ============================================================================
// Request Interceptor
// ============================================================================

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

// ============================================================================
// Response Interceptor
// ============================================================================

/**
 * Log responses in development mode
 */
export const responseLoggerInterceptor = async (response: Response): Promise<Response> => {
  if (import.meta.env.DEV) {
    const clonedResponse = response.clone();
    const data = await clonedResponse.json().catch(() => null);
    console.log('📥 Response:', {
      status: response.status,
      statusText: response.statusText,
      data,
    });
  }
  return response;
};

/**
 * Transform response data structure
 */
export const responseTransformInterceptor = async (response: Response): Promise<Response> => {
  // You can add custom response transformation here
  return response;
};

// ============================================================================
// Error Interceptor
// ============================================================================

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
        // Attempt to refresh the token
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

        // Retry all pending requests with new token
        onRefreshed(newToken);

        // Retry the original request
        if (config.headers) {
          (config.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }

        return httpClient.request(config.baseURL || '', config) as never;
      } catch {
        isRefreshing = false;
        tokenManager.clearTokens();

        // Redirect to login
        window.location.href = '/login';
        throw error;
      }
    } else {
      // Wait for token refresh to complete
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
    // You can show a toast notification here
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

// ============================================================================
// Setup Interceptors
// ============================================================================

/**
 * Initialize all interceptors
 * Call this function once in your app initialization
 */
export function setupInterceptors() {
  // Request interceptors (executed in order)
  httpClient.addRequestInterceptor(authRequestInterceptor);
  httpClient.addRequestInterceptor(commonHeadersInterceptor);
  httpClient.addRequestInterceptor(requestLoggerInterceptor);

  // Response interceptors (executed in order)
  httpClient.addResponseInterceptor(responseLoggerInterceptor);
  httpClient.addResponseInterceptor(responseTransformInterceptor);

  // Error interceptors (executed in order)
  httpClient.addErrorInterceptor(authErrorInterceptor);
  httpClient.addErrorInterceptor(errorLoggerInterceptor);
}
