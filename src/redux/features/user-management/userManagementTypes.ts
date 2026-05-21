/**
 * User Management Redux Types
 * Type definitions for user management state management
 */

import type { User, UserFilters } from '@/services/api/types/users.types';

// ============================================================================
// State Types
// ============================================================================

export interface UserManagementState {
  // Data
  users: User[];
  currentUser: User | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: UserFilters;

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isAssigning: boolean;

  // Error States
  error: string | null;
  validationErrors: Record<string, string> | null;

  // UI States
  selectedUserIds: string[];
  isInitialized: boolean;
}

// ============================================================================
// Action Payload Types
// ============================================================================

export interface FetchUsersPayload {
  page?: number;
  limit?: number;
  filters?: UserFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Async Thunk Return Types
// ============================================================================

export interface FetchUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
