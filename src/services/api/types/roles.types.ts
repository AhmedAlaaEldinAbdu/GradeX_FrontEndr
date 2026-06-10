/**
 * Roles API Types
 * Type definitions for roles-related API requests and responses
 */

import type { Permission } from './permissions.types';

// ============================================================================
// Base Role Types
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
  permissions: string[];
  schoolBrancheId?: string;
}

export interface UpdateRoleRequest {
  roleId: string;
  roleName: string;
  description?: string;
  permissions: string[];
  schoolBrancheId?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface RoleListResponse {
  items: Role[];
  totalItems: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface RoleDetailResponse {
  data: Role;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface RoleFilters {
  searchTerm?: string;
  schoolBranchesId?: string;
}

// ============================================================================
// Query Params
// ============================================================================

export interface RoleQueryParams extends RoleFilters {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: RoleSortField;
  sortOrder?: 'asc' | 'desc';
  // Backend query-param spelling (PascalCase, singular) — matches the other list endpoints.
  SchoolBranchId?: string;
}

export const RoleSortField = {
  NAME: 'name',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type RoleSortField = (typeof RoleSortField)[keyof typeof RoleSortField];

// ============================================================================
// Validation Types
// ============================================================================

export interface RoleValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RoleValidationResponse {
  valid: boolean;
  errors?: RoleValidationError[];
}
