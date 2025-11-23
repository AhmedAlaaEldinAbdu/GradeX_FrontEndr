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
  reasonAR: string;
  reasonEN: string;
  fileName: string;
  filePath: string;
  lkCountryId: string;
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
  LKCountryId?: string;
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
  StartDate?: string; // ISO date-time string (for official holidays)
  EndDate?: string; // ISO date-time string (for official holidays)
  Day?: number; // Day enum value 1-7 (for fixed holidays)
  LeaveCategory: number; // 1 for fixed, 2 for official
  ReasonAr: string;
  ReasonEN: string; // Note: uppercase EN
  FileName?: string;
  FilePath?: string;
  File?: File; // binary file
  LKCountryId: string; // UUID
}

export interface UpdateOfficialHolidayRequest {
  StartDate?: string; // ISO date-time string (for official holidays)
  EndDate?: string; // ISO date-time string (for official holidays)
  Day?: number; // Day enum value 1-7 (for fixed holidays)
  LeaveCategory: number; // 1 for fixed, 2 for official
  ReasonAr: string;
  ReasonEN: string; // Note: uppercase EN
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
  leaveCategory?: number; // 1 for fixed, 2 for official
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
