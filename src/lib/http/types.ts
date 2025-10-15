/**
 * HTTP Client Types
 * Type definitions for the HTTP client
 */

export interface FetchConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
  retry?: RetryConfig;
  onUploadProgress?: (progress: number) => void;
}

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: FetchError) => boolean;
}

export interface FetchError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
  config?: FetchConfig;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export type RequestInterceptor = (config: FetchConfig) => FetchConfig | Promise<FetchConfig>;

export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export type ErrorInterceptor = (error: FetchError) => Promise<never>;
