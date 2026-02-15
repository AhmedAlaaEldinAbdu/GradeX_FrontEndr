/**
 * Users API Types
 * Type definitions for users-related API requests and responses
 */

// ============================================================================
// Base User Types
// ============================================================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  auth0Id: string | null;
  phoneNumber: string;
  roles: string[];
  roleId?: string; // Role ID for forms
  roleName?: string; // Role name for display
  lkCountryId?: string; // Country ID for forms
  countryName?: string; // Country name for display
  schoolBranchId?: string; // School branch ID (optional)
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateUserRequest {
  fullName: string;
  email: string;
  roleId: string;
  phoneNumber: string;
  lkCountryId: string;
  schoolBranchId?: string;
}

export interface UpdateUserRequest {
  userId: string;
  fullName: string;
  email: string;
  roleId: string;
  phoneNumber: string;
  lkCountryId: string;
  schoolBranchId?: string;
}

export interface DeleteUserRequest {
  userId: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface UserListResponse {
  items: User[];
  totalItems: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface UserDetailResponse {
  data: User;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface UserFilters {
  searchTerm?: string;
  roleId?: string;
  lkCountryId?: string;
}

// ============================================================================
// Query Params
// ============================================================================

export interface UserQueryParams extends UserFilters {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
  Search?: string;
  PageNumber?: number;
  PageSize?: number;
}

export const UserSortField = {
  NAME: 'fullName',
  EMAIL: 'email',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type UserSortField = (typeof UserSortField)[keyof typeof UserSortField];

// ============================================================================
// Validation Types
// ============================================================================

export interface UserValidationError {
  field: string;
  message: string;
  code: string;
}

export interface UserValidationResponse {
  valid: boolean;
  errors?: UserValidationError[];
}
