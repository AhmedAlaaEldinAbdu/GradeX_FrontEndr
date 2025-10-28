/**
 * Academic System Redux Types
 * Type definitions for academic system state management
 */

import type { AcademicSubSystemResponse } from '@/services/api/types/academic-system.types';

// ============================================================================
// State Types
// ============================================================================

export interface AcademicSystemState {
  // Data
  academicSystems: AcademicSubSystemResponse[];

  // Pagination
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };

  // Loading States
  isLoading: boolean;

  // Error States
  error: string | null;

  // Initialization States
  isInitialized: boolean;

  // Timestamp for cache management
  lastFetched: number | null;
}

// ============================================================================
// Action Payload Types
// ============================================================================

export interface FetchAcademicSystemsPayload {
  pageIndex?: number;
  pageSize?: number;
  type?: number;
  name?: string;
  subsystemId?: string;
  countryId?: string;
  force?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Cache duration in milliseconds (24 hours)
 */
export const ACADEMIC_SYSTEM_CACHE_DURATION = 24 * 60 * 60 * 1000;
