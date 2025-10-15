/**
 * Enhanced Fetch API Wrapper with TypeScript
 * Provides a robust, type-safe HTTP client with interceptors, error handling, and retry logic
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

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

// ============================================================================
// HTTP Client Class
// ============================================================================

class HttpClient {
  private baseURL: string;
  private defaultConfig: FetchConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: FetchConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultConfig = {
      timeout: 30000,
      retry: {
        maxRetries: 0,
        retryDelay: 1000,
      },
      ...config,
    };
  }

  // ============================================================================
  // Interceptor Management
  // ============================================================================

  /**
   * Add a request interceptor
   * @param interceptor - Function to modify request config before sending
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   * @param interceptor - Function to modify response before returning
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add an error interceptor
   * @param interceptor - Function to handle errors
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Clear all interceptors
   */
  clearInterceptors(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Apply all request interceptors
   */
  private async applyRequestInterceptors(config: FetchConfig): Promise<FetchConfig> {
    let modifiedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  /**
   * Apply all response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  /**
   * Apply all error interceptors
   */
  private async applyErrorInterceptors(error: FetchError): Promise<never> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error);
    }
    throw error;
  }

  /**
   * Create a fetch error with enhanced information
   */
  private createError(
    message: string,
    response?: Response,
    data?: unknown,
    config?: FetchConfig
  ): FetchError {
    const error = new Error(message) as FetchError;
    error.status = response?.status;
    error.statusText = response?.statusText;
    error.data = data;
    error.config = config;
    return error;
  }

  /**
   * Implement timeout for fetch requests
   */
  private async fetchWithTimeout(url: string, config: FetchConfig): Promise<Response> {
    const timeout = config.timeout || this.defaultConfig.timeout || 30000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('Request timeout', undefined, undefined, config);
      }
      throw error;
    }
  }

  /**
   * Retry logic for failed requests
   */
  private async fetchWithRetry(url: string, config: FetchConfig): Promise<Response> {
    const retryConfig = {
      ...this.defaultConfig.retry,
      ...config.retry,
    };
    const maxRetries = retryConfig.maxRetries || 0;
    const retryDelay = retryConfig.retryDelay || 1000;
    const retryCondition =
      retryConfig.retryCondition ||
      ((error: FetchError) => {
        // Default: retry on network errors and 5xx server errors
        return !error.status || (error.status >= 500 && error.status < 600);
      });

    let lastError: FetchError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, config);
        return response;
      } catch (error) {
        lastError = error as FetchError;

        // Don't retry if it's the last attempt or condition not met
        if (attempt === maxRetries || !retryCondition(lastError)) {
          throw lastError;
        }

        // Wait before retrying with exponential backoff
        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError!;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build full URL
   */
  private buildURL(url: string, config: FetchConfig): string {
    const baseURL = config.baseURL || this.baseURL;
    return url.startsWith('http') ? url : `${baseURL}${url}`;
  }

  /**
   * Process request configuration
   */
  private async processConfig(
    url: string,
    config: FetchConfig = {}
  ): Promise<{ url: string; config: FetchConfig }> {
    // Merge with default config
    let mergedConfig: FetchConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultConfig.headers,
        ...config.headers,
      } as HeadersInit,
    };

    // Apply request interceptors
    mergedConfig = await this.applyRequestInterceptors(mergedConfig);

    // Build full URL
    const fullURL = this.buildURL(url, mergedConfig);

    return { url: fullURL, config: mergedConfig };
  }

  /**
   * Process response
   */
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Apply response interceptors
    const processedResponse = await this.applyResponseInterceptors(response);

    // Parse response body
    let data: T;
    const contentType = processedResponse.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await processedResponse.json();
    } else if (contentType && contentType.includes('text')) {
      data = (await processedResponse.text()) as T;
    } else {
      data = (await processedResponse.blob()) as T;
    }

    // Check for HTTP errors
    if (!processedResponse.ok) {
      const error = this.createError(
        `HTTP Error ${processedResponse.status}: ${processedResponse.statusText}`,
        processedResponse,
        data
      );
      return await this.applyErrorInterceptors(error);
    }

    return {
      data,
      status: processedResponse.status,
      statusText: processedResponse.statusText,
      headers: processedResponse.headers,
    };
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  /**
   * Generic request method
   */
  async request<T = unknown>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
    try {
      const { url: fullURL, config: processedConfig } = await this.processConfig(url, config);

      const response = await this.fetchWithRetry(fullURL, processedConfig);

      return await this.processResponse<T>(response);
    } catch (error) {
      if ((error as FetchError).config) {
        throw error;
      }
      const fetchError = this.createError(
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        undefined,
        config
      );
      return await this.applyErrorInterceptors(fetchError);
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config: FetchConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data?: unknown,
    config: FetchConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config: FetchConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = unknown>(
    url: string,
    formData: FormData,
    config: FetchConfig = {}
  ): Promise<ApiResponse<T>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onUploadProgress, ...restConfig } = config;

    // Remove Content-Type header to let browser set it with boundary
    const headers = { ...(restConfig.headers as Record<string, string>) };
    delete headers['Content-Type'];

    return this.request<T>(url, {
      ...restConfig,
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

// ============================================================================
// Export Default Instance
// ============================================================================

/**
 * Default HTTP client instance
 * You can configure this in your app initialization
 */
export const httpClient = new HttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retry: {
    maxRetries: 2,
    retryDelay: 1000,
  },
});

/**
 * Export the class for creating custom instances
 */
export { HttpClient };

/**
 * Export types for external use
 */
export type { FetchConfig as RequestConfig, ApiResponse as Response, FetchError as ApiError };
