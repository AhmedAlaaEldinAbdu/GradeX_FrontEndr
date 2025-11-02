/**
 * Logger Utility
 * Centralized logging system with different log levels and development-only logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogOptions {
  level?: LogLevel;
  data?: unknown;
  emoji?: string;
  group?: boolean;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Check if logging is enabled
   */
  private isEnabled(): boolean {
    return this.isDevelopment;
  }

  /**
   * Get emoji based on log level
   */
  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
    };
    return emojis[level] || 'ℹ️';
  }

  /**
   * Get console method based on log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    const methods: Record<LogLevel, typeof console.log> = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
      success: console.log,
    };
    return methods[level] || console.log;
  }

  /**
   * Format timestamp
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  /**
   * Base log method
   */
  private log(level: LogLevel, message: string, options: LogOptions = {}): void {
    if (!this.isEnabled()) return;

    const { data, emoji, group = false } = options;
    const consoleMethod = this.getConsoleMethod(level);
    const logEmoji = emoji || this.getEmoji(level);
    const timestamp = this.getTimestamp();

    const prefix = `[${timestamp}] ${logEmoji}`;

    if (group && data) {
      console.group(`${prefix} ${message}`);
      console.log(data);
      console.groupEnd();
    } else {
      consoleMethod(`${prefix} ${message}`, data !== undefined ? data : '');
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, { level: 'debug', data });
  }

  /**
   * Info level logging
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, { level: 'info', data });
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, { level: 'warn', data });
  }

  /**
   * Error level logging
   */
  error(message: string, data?: unknown): void {
    this.log('error', message, { level: 'error', data });
  }

  /**
   * Success level logging
   */
  success(message: string, data?: unknown): void {
    this.log('success', message, { level: 'success', data });
  }

  /**
   * Group logging for related logs
   */
  group(title: string, callback: () => void): void {
    if (!this.isEnabled()) return;

    console.group(`📦 ${title}`);
    callback();
    console.groupEnd();
  }

  /**
   * Table logging for structured data
   */
  table(data: unknown): void {
    if (!this.isEnabled()) return;
    console.table(data);
  }

  /**
   * HTTP Request logging
   */
  request(method: string, url: string, data?: unknown): void {
    if (!this.isEnabled()) return;

    const emoji = this.getRequestEmoji(method);
    this.log('info', `Request: ${method.toUpperCase()} ${url}`, {
      emoji,
      data: data ? { payload: data } : undefined,
      group: !!data,
    });
  }

  /**
   * HTTP Response logging
   */
  response(method: string, url: string, status: number, data?: unknown): void {
    if (!this.isEnabled()) return;

    const emoji = this.getResponseEmoji(status);
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'success';

    this.log(level, `Response: ${method.toUpperCase()} ${url} [${status}]`, {
      emoji,
      data: data ? { response: data } : undefined,
      group: !!data,
    });
  }

  /**
   * HTTP Error logging
   */
  httpError(method: string, url: string, error: unknown): void {
    if (!this.isEnabled()) return;

    console.group(`❌ HTTP Error: ${method.toUpperCase()} ${url}`);
    console.error(error);
    console.groupEnd();
  }

  /**
   * Redux Action logging
   */
  reduxAction(type: string, payload?: unknown): void {
    if (!this.isEnabled()) return;

    const emoji = '⚡';
    this.log('info', `Redux Action: ${type}`, {
      emoji,
      data: payload,
      group: !!payload,
    });
  }

  /**
   * Component lifecycle logging
   */
  component(name: string, action: 'mount' | 'unmount' | 'update', data?: unknown): void {
    if (!this.isEnabled()) return;

    const emojis = {
      mount: '🔵',
      unmount: '🔴',
      update: '🟡',
    };

    this.log('debug', `Component ${name}: ${action}`, {
      emoji: emojis[action],
      data,
    });
  }

  /**
   * Performance logging
   */
  performance(label: string, duration: number): void {
    if (!this.isEnabled()) return;

    const emoji = '⏱️';
    this.log('info', `Performance: ${label}`, {
      emoji,
      data: { duration: `${duration.toFixed(2)}ms` },
    });
  }

  /**
   * Custom emoji logging
   */
  custom(emoji: string, message: string, data?: unknown): void {
    this.log('info', message, { emoji, data, group: !!data });
  }

  /**
   * Get emoji for HTTP request method
   */
  private getRequestEmoji(method: string): string {
    const emojis: Record<string, string> = {
      GET: '📥',
      POST: '📤',
      PUT: '✏️',
      PATCH: '🔧',
      DELETE: '🗑️',
    };
    return emojis[method.toUpperCase()] || '🚀';
  }

  /**
   * Get emoji for HTTP response status
   */
  private getResponseEmoji(status: number): string {
    if (status >= 200 && status < 300) return '✅';
    if (status >= 300 && status < 400) return '↪️';
    if (status >= 400 && status < 500) return '⚠️';
    if (status >= 500) return '❌';
    return '❓';
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for extensions
export type { LogLevel, LogOptions };
