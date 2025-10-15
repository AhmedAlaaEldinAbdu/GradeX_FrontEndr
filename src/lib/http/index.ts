/**
 * HTTP Client Instance
 * Default configured HTTP client instance
 */

import { HttpClient } from './client';

export const httpClient = new HttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retry: {
    maxRetries: 2,
    retryDelay: 1000,
  },
});

export * from './types';
export * from './client';
