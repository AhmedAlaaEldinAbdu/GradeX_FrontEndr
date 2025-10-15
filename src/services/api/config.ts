/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// ============================================================================
// Environment Variables
// ============================================================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // Schools
  SCHOOLS: {
    BASE: '/schools',
    LIST: '/schools',
    CREATE: '/schools',
    GET_BY_ID: (id: string) => `/schools/${id}`,
    UPDATE: (id: string) => `/schools/${id}`,
    DELETE: (id: string) => `/schools/${id}`,
    RESTORE: (id: string) => `/schools/${id}/restore`,
    PENDING: '/schools/pending',
    REJECTED: '/schools/rejected',
    DELETED: '/schools/deleted',
    APPROVE: (id: string) => `/schools/${id}/approve`,
    REJECT: (id: string) => `/schools/${id}/reject`,
    ACTIVATE: (id: string) => `/schools/${id}/activate`,
    DEACTIVATE: (id: string) => `/schools/${id}/deactivate`,
    STATISTICS: '/schools/statistics',
    EXPORT: '/schools/export',
    BULK_DELETE: '/schools/bulk-delete',
    BULK_APPROVE: '/schools/bulk-approve',
    BULK_REJECT: '/schools/bulk-reject',
  },

  // System Users
  USERS: {
    BASE: '/users',
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Roles & Permissions
  ROLES: {
    BASE: '/roles',
    LIST: '/roles',
    CREATE: '/roles',
    GET_BY_ID: (id: string) => `/roles/${id}`,
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    PERMISSIONS: '/roles/permissions',
  },

  // Control Panel
  CONTROL_PANEL: {
    BASE: '/control-panel',
    SETTINGS: '/control-panel/settings',
  },

  // Student Management
  STUDENTS: {
    BASE: '/students',
    LIST: '/students',
    CREATE: '/students',
    GET_BY_ID: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
  },

  // File Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    BULK: '/upload/bulk',
  },
} as const;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Filter Types
// ============================================================================

export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
