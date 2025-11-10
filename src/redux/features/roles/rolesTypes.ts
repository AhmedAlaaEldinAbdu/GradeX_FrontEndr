/**
 * Roles Redux Types
 * Type definitions for roles state management
 */

import type { Role, RoleFilters } from '@/services/api/types/roles.types';

// ============================================================================
// State Types
// ============================================================================

export interface RolesState {
  // Data
  roles: Role[];
  currentRole: Role | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: RoleFilters;

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error States
  error: string | null;
  validationErrors: Record<string, string> | null;

  // UI States
  selectedRoleIds: string[];
  isInitialized: boolean;
}

// ============================================================================
// Action Payload Types
// ============================================================================

export interface FetchRolesPayload {
  page?: number;
  limit?: number;
  filters?: RoleFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Async Thunk Return Types
// ============================================================================

export interface FetchRolesResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
