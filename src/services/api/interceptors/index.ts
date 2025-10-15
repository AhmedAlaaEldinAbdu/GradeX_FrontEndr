/**
 * API Interceptors Setup
 * Initialize and configure all interceptors
 */

import { httpClient } from '@/lib/http';
import {
  authRequestInterceptor,
  commonHeadersInterceptor,
  requestLoggerInterceptor,
} from './request.interceptors';
import { responseLoggerInterceptor, responseTransformInterceptor } from './response.interceptors';
import { authErrorInterceptor, errorLoggerInterceptor } from './error.interceptors';

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

// Re-export for convenience
export * from './request.interceptors';
export * from './response.interceptors';
export * from './error.interceptors';
