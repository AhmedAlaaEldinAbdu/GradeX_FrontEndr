/**
 * Permissions API Types
 * Type definitions for permissions-related API requests and responses
 */

// ============================================================================
// Base Permission Types
// ============================================================================

export interface Permission {
  id: string;
  code: string;
  category: string;
  arabicName: string;
  englishName: string;
}

export interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

// ============================================================================
// Response Types
// ============================================================================

export interface PermissionsListResponse {
  permissionGroupDtos: PermissionGroup[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

// ============================================================================
// Query Params
// ============================================================================

export interface PermissionsQueryParams {
  PageIndex?: number;
  PageSize?: number;
}
