/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// ============================================================================
// Environment Configuration
// ============================================================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://gradexpro.runasp.net/api',
  TIMEOUT: 30000,
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

const SCHOOLS = '/schools';
const AUTH = '/auth';
const USERS = '/users';
const ROLES = '/roles';
const UPLOAD = '/upload';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${AUTH}/login`,
    LOGOUT: `${AUTH}/logout`,
    REFRESH: `${AUTH}/refresh`,
    REGISTER: `${AUTH}/register`,
    FORGOT_PASSWORD: `${AUTH}/forgot-password`,
    RESET_PASSWORD: `${AUTH}/reset-password`,
    VERIFY_EMAIL: `${AUTH}/verify-email`,
    VERIFY_OTP: `${AUTH}/verify-otp`,
  },

  // Schools Management
  SCHOOLS: {
    BASE: SCHOOLS,
    LIST: SCHOOLS,
    CREATE: SCHOOLS,
    GET_BY_ID: (id: string) => `${SCHOOLS}/${id}`,
    UPDATE: (id: string) => `${SCHOOLS}/${id}`,
    DELETE: (id: string) => `${SCHOOLS}/${id}`,
    RESTORE: (id: string) => `${SCHOOLS}/${id}/restore`,
    UPDATE_STATUS: (id: string) => `${SCHOOLS}/${id}/status`,
    UPDATE_REQUEST: (id: string) => `${SCHOOLS}/${id}/update-request`,
    LOCATION_FILTERS: `${SCHOOLS}/location/filters`,
    STATISTICS: `${SCHOOLS}/statistics`,
    EXPORT: `${SCHOOLS}/export`,
    BULK_DELETE: `${SCHOOLS}/bulk-delete`,
    BULK_APPROVE: `${SCHOOLS}/bulk-approve`,
    BULK_REJECT: `${SCHOOLS}/bulk-reject`,
  },

  // User Management
  USERS: {
    BASE: USERS,
    LIST: USERS,
    CREATE: USERS,
    GET_BY_ID: (id: string) => `${USERS}/${id}`,
    UPDATE: (id: string) => `${USERS}/${id}`,
    DELETE: (id: string) => `${USERS}/${id}`,
  },

  // Roles & Permissions
  ROLES: {
    BASE: ROLES,
    LIST: ROLES,
    CREATE: ROLES,
    GET_BY_ID: (id: string) => `${ROLES}/${id}`,
    UPDATE: (id: string) => `${ROLES}/${id}`,
    DELETE: (id: string) => `${ROLES}/${id}`,
    PERMISSIONS: `${ROLES}/permissions`,
  },

  // File Upload
  UPLOAD: {
    IMAGE: `${UPLOAD}/image`,
    DOCUMENT: `${UPLOAD}/document`,
    BULK: `${UPLOAD}/bulk`,
  },

  // Control Panel
  CONTROL_PANEL: {
    BASE: '/control-panel',
    SETTINGS: '/control-panel/settings',
  },

  // Students
  STUDENTS: {
    BASE: '/students',
    LIST: '/students',
    CREATE: '/students',
    GET_BY_ID: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
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

export interface ApiResponseModel<T = unknown> {
  value: T;
  data?: T;
  status: number;
  isSuccess: boolean;
  successMessage: string;
  correlationId: string;
  location: string;
  errors: string[];
  validationErrors: ValidationErrorResponse[] | string[] | null;
}
export interface ValidationErrorResponse {
  identifier: string | null;
  errorMessage: string;
  errorCode: string | null;
  severity: number;
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
// Pagination & Filtering
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
