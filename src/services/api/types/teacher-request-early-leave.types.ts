/**
 * TeacherRequestEarlyLeave Types
 * Type definitions for the TeacherRequestEarlyLeave controller.
 */
import type { ApiResponseModel } from '../config';

// ============================================================================
// Query params
// ============================================================================

export interface GetEarlyLeavesQueryParams {
  PageNumber?: number;
  PageSize?: number;
  SchoolBranchId?: string;
  SearchTeacherName?: string;
  RequestStatus?: number;
}

// ============================================================================
// Request bodies
// ============================================================================

export interface CreateEarlyLeaveRequest {
  TeacherId: string;
  SchoolBranchId: string;
  Date: string | Date; // DateTime
  FromTime: string; // TimeSpan (HH:mm:ss format)
  ToTime: string; // TimeSpan (HH:mm:ss format)
  Reason: string;
  Attachment?: File;
}

export interface UpdateEarlyLeaveRequest {
  Id: string;
  TeacherId: string;
  SchoolBranchId: string;
  Date: string | Date; // DateTime
  FromTime: string; // TimeSpan (HH:mm:ss format)
  ToTime: string; // TimeSpan (HH:mm:ss format)
  Reason: string;
  Attachment?: File;
}

export interface DeleteEarlyLeaveRequest {
  Id: string;
}

// ============================================================================
// Response DTOs
// ============================================================================

export interface EarlyLeaveRequestDto {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatarPath: string | null;
  schoolBranchId: string;
  schoolBranchName: string;
  date: string; // DateTime
  fromTime: string; // TimeSpan
  toTime: string; // TimeSpan
  reason: string;
  attachmentPath: string | null;
  attachmentName: string | null;
  status: number; // 1 = Pending, 2 = Approved, 3 = Rejected
  createdAt: string; // DateTime
  updatedAt?: string; // DateTime
}

// ============================================================================
// Paginated list wrapper
// ============================================================================

export interface PaginationMeta {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface EarlyLeavesListData extends PaginationMeta {
  requestEarlyLeaves: EarlyLeaveRequestDto[];
}

// ============================================================================
// Response types
// ============================================================================

export type GetEarlyLeavesResponse = ApiResponseModel<EarlyLeavesListData>;
export type GetEarlyLeaveByIdResponse = ApiResponseModel<EarlyLeaveRequestDto>;
export type CreateEarlyLeaveResponse = ApiResponseModel<EarlyLeaveRequestDto>;
export type UpdateEarlyLeaveResponse = ApiResponseModel<EarlyLeaveRequestDto>;
export type DeleteEarlyLeaveResponse = ApiResponseModel<null>;
