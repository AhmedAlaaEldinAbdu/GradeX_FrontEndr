/**
 * TeacherRequests Types
 * Type definitions for the TeacherRequests controller (الطلبات الإدارية).
 *
 * TODO(api): The response DTOs below are placeholders. Replace the `unknown`
 * index signatures with the real fields once the API response schemas are
 * provided. Query params and request bodies already match the swagger spec.
 */
import type { ApiResponseModel } from '../config';

// ============================================================================
// Enums (values per swagger; labels are confirmed when responses are provided)
// ============================================================================

/** Apply-job-advertisement application status. Swagger values: 1–6. */
export type TeacherApplicationStatus = 1 | 2 | 3 | 4 | 5 | 6;
export const TEACHER_APPLICATION_STATUS_VALUES: TeacherApplicationStatus[] = [1, 2, 3, 4, 5, 6];

/** Work schedule (WorkShedule). Swagger values: 1–3. */
export type TeacherWorkSchedule = 1 | 2 | 3;
export const TEACHER_WORK_SCHEDULE_VALUES: TeacherWorkSchedule[] = [1, 2, 3];

/** Early-leave request status (RequestStatus / update-status). Swagger values: 1–3. */
export type EarlyLeaveRequestStatus = 1 | 2 | 3;
export const EARLY_LEAVE_REQUEST_STATUS_VALUES: EarlyLeaveRequestStatus[] = [1, 2, 3];

// ============================================================================
// Query params (PascalCase to match swagger query keys)
// ============================================================================

export interface TeacherRequestsSummaryParams {
  SchoolBranchId?: string;
}

export interface JobApplicationsQueryParams {
  SchoolBranchId?: string;
  ApplicationStatus?: TeacherApplicationStatus;
  TeacherName?: string;
  JobAdvertismentId?: string;
  WorkShedule?: TeacherWorkSchedule;
  QualificationId?: string;
  YearsExperience?: number;
  NationalityId?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface EarlyLeaveQueryParams {
  SchoolBranchId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTeacherName?: string;
  RequestStatus?: EarlyLeaveRequestStatus;
  /** ISO date-time string. */
  Date?: string;
}

export interface TeacherMessagesQueryParams {
  SchoolBranchId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTeacherName?: string;
  /** ISO date-time string. */
  Date?: string;
}

export interface TeacherNotesQueryParams {
  SchoolBranchId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTeacherName?: string;
  /** ISO date-time string. */
  Date?: string;
}

// ============================================================================
// Request bodies
// ============================================================================

export interface UpdateEarlyLeaveStatusRequest {
  id: string;
  status: EarlyLeaveRequestStatus;
}

// ============================================================================
// Response DTOs (placeholders — TODO: fill from API responses)
// ============================================================================

export interface TeacherRequestsSummaryDto {
  // TODO(api): replace with the real summary fields.
  [key: string]: unknown;
}

export interface JobApplicationRequestDto {
  id: string;
  // TODO(api): replace with the real job-application fields.
  [key: string]: unknown;
}

export interface EarlyLeaveRequestDto {
  id: string;
  // TODO(api): replace with the real early-leave fields.
  [key: string]: unknown;
}

export interface TeacherMessageDto {
  id: string;
  // TODO(api): replace with the real message fields.
  [key: string]: unknown;
}

export interface TeacherNoteDto {
  id: string;
  // TODO(api): replace with the real note fields.
  [key: string]: unknown;
}

// ============================================================================
// Paginated list wrapper
// ============================================================================

/**
 * Generic paginated payload. The actual inner array key is confirmed once the
 * API responses are provided; until then list items are exposed under `items`.
 */
export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type TeacherRequestsSummaryResponse = ApiResponseModel<TeacherRequestsSummaryDto>;
export type JobApplicationsListResponse = ApiResponseModel<PaginatedList<JobApplicationRequestDto>>;
export type JobApplicationResponse = ApiResponseModel<JobApplicationRequestDto>;
export type EarlyLeavesListResponse = ApiResponseModel<PaginatedList<EarlyLeaveRequestDto>>;
export type EarlyLeaveResponse = ApiResponseModel<EarlyLeaveRequestDto>;
export type TeacherMessagesListResponse = ApiResponseModel<PaginatedList<TeacherMessageDto>>;
export type TeacherMessageResponse = ApiResponseModel<TeacherMessageDto>;
export type TeacherNotesListResponse = ApiResponseModel<PaginatedList<TeacherNoteDto>>;
export type TeacherNoteResponse = ApiResponseModel<TeacherNoteDto>;
