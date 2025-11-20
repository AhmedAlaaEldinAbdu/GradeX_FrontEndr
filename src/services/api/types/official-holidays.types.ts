/**
 * Official Holidays API Types
 * Type definitions for official holidays/leave management
 */

// ============================================================================
// Constants
// ============================================================================

export const LeaveCategoryEnum = {
  STATIC: 'static',
  OFFICIAL: 'official',
} as const;

export type LeaveCategory = (typeof LeaveCategoryEnum)[keyof typeof LeaveCategoryEnum];

// ============================================================================
// Main Types
// ============================================================================

export interface OfficialHoliday {
  id: string;
  startDate: string;
  endDate: string;
  leaveCategory: LeaveCategory | string;
  reason: string;
  fileName: string;
  filePath: string;
  countryNameAR: string;
  countryNameEN: string;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface OfficialHolidaysQueryParams {
  PageIndex?: number;
  PageSize?: number;
  searchTerm?: string;
  countryId?: string;
  leaveCategory?: LeaveCategory | string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'startDate' | 'endDate' | 'countryNameAR' | 'countryNameEN';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Response Types
// ============================================================================

export interface OfficialHolidaysListResponse {
  leaveDto: OfficialHoliday[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface OfficialHolidayDetailResponse {
  data: OfficialHoliday;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateOfficialHolidayRequest {
  startDate: string;
  endDate: string;
  leaveCategory: LeaveCategory | string;
  reason: string;
  countryId?: string;
  file?: File;
}

export interface UpdateOfficialHolidayRequest {
  startDate?: string;
  endDate?: string;
  leaveCategory?: LeaveCategory | string;
  reason?: string;
  countryId?: string;
  file?: File;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface OfficialHolidaysFilters {
  searchTerm?: string;
  countryId?: string;
  leaveCategory?: LeaveCategory | string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface OfficialHolidaysStatisticsResponse {
  total: number;
  byCountry: Record<string, number>;
  byCategory: Record<string, number>;
}

// ============================================================================
// Bulk Operation Types
// ============================================================================

export interface OfficialHolidaysBulkOperationResponse {
  success: boolean;
  successCount: number;
  failedCount: number;
  failed?: Array<{
    id: string;
    reason: string;
  }>;
}
