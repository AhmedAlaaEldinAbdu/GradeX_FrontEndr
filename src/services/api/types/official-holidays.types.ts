/**
 * Official Holidays API Types
 * Type definitions for official holidays/leave management
 */

// ============================================================================
// Constants
// ============================================================================

export const LeaveCategoryEnumNumber = {
  FIXED: 1,
  OFFICIAL: 2,
} as const;

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
  StartDate: string; // ISO date-time string
  EndDate: string; // ISO date-time string
  LeaveCategory: number; // 1 for fixed, 2 for official
  ReasonInAr: string;
  ReasonInEn: string;
  FileName?: string;
  FilePath?: string;
  File?: File; // binary file
  LKCountryId: string; // UUID
}

export interface UpdateOfficialHolidayRequest {
  StartDate: string; // ISO date-time string
  EndDate: string; // ISO date-time string
  LeaveCategory: number; // 1 for fixed, 2 for official
  ReasonInAr: string;
  ReasonInEn: string;
  FileName?: string;
  FilePath?: string;
  File?: File; // binary file
  LKCountryId: string; // UUID
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
