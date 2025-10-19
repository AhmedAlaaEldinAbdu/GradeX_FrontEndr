import type {
  FetchConfig,
  FetchError,
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from './types';

export class HttpClient {
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

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  clearInterceptors(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async applyRequestInterceptors(config: FetchConfig): Promise<FetchConfig> {
    let modifiedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  private async applyErrorInterceptors(error: FetchError): Promise<never> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error);
    }
    throw error;
  }

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
        return !error.status || (error.status >= 500 && error.status < 600);
      });

    let lastError: FetchError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, config);
        return response;
      } catch (error) {
        lastError = error as FetchError;

        if (attempt === maxRetries || !retryCondition(lastError)) {
          throw lastError;
        }

        await this.delay(retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildURL(url: string, config: FetchConfig): string {
    const baseURL = config.baseURL || this.baseURL;
    return url.startsWith('http') ? url : `${baseURL}${url}`;
  }

  private async processConfig(
    url: string,
    config: FetchConfig = {}
  ): Promise<{ url: string; config: FetchConfig }> {
    let mergedConfig: FetchConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultConfig.headers,
        ...config.headers,
      },
    };

    mergedConfig = await this.applyRequestInterceptors(mergedConfig);
    const fullURL = this.buildURL(url, mergedConfig);

    return { url: fullURL, config: mergedConfig };
  }

  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const processedResponse = await this.applyResponseInterceptors(response);

    let data: T;
    const contentType = processedResponse.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await processedResponse.json();
    } else if (contentType && contentType.includes('text')) {
      data = (await processedResponse.text()) as T;
    } else {
      data = (await processedResponse.blob()) as T;
    }

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

  async get<T = unknown>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

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

  async delete<T = unknown>(url: string, config: FetchConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  async upload<T = unknown>(
    url: string,
    formData: FormData,
    config: FetchConfig = {}
  ): Promise<ApiResponse<T>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { onUploadProgress, ...restConfig } = config;
    const headers = { ...restConfig.headers } as Record<string, string>;
    delete headers['Content-Type'];

    return this.request<T>(url, {
      ...restConfig,
      method: 'POST',
      body: formData,
      headers,
    });
  }
}
