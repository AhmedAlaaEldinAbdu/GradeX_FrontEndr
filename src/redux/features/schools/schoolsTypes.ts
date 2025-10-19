/**
 * Schools Redux Types
 * Type definitions for schools state management
 */

import type {
  School,
  SchoolDetail,
  SchoolStatus,
  SchoolStatisticsResponse,
  SchoolFilters,
} from '@/services/api/types/school.types';

// ============================================================================
// State Types
// ============================================================================

export interface SchoolsState {
  // Data
  schools: School[];
  currentSchool: SchoolDetail | null;
  statistics: SchoolStatisticsResponse | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Filters
  filters: SchoolFilters;

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingStats: boolean;

  // Error States
  error: string | null;
  validationErrors: Record<string, string> | null;

  // UI States
  selectedSchoolIds: string[];
  isInitialized: boolean;
}

// ============================================================================
// Action Payload Types
// ============================================================================

export interface FetchSchoolsPayload {
  page?: number;
  limit?: number;
  filters?: SchoolFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateSchoolStatusPayload {
  id: string;
  status: SchoolStatus;
  reason?: string;
  notes?: string;
}

export interface BulkOperationPayload {
  ids: string[];
  action: 'delete' | 'approve' | 'reject';
  reason?: string;
}

// ============================================================================
// Async Thunk Return Types
// ============================================================================

export interface FetchSchoolsResponse {
  data: School[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SchoolDetailResult {
  data: SchoolDetail;
}

export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  failed?: Array<{
    id: string;
    reason: string;
  }>;
}
