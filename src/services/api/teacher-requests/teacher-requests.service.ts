/**
 * TeacherRequests API Service
 * Handles all API calls for the TeacherRequests controller (الطلبات الإدارية).
 */
import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { TeacherRequestsEndpoints } from '../endpoints/teacher-requests-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  TeacherRequestsSummaryParams,
  TeacherRequestsSummaryResponse,
  JobApplicationsQueryParams,
  JobApplicationsListResponse,
  JobApplicationResponse,
  EarlyLeaveQueryParams,
  EarlyLeavesListResponse,
  EarlyLeaveResponse,
  UpdateEarlyLeaveStatusRequest,
  TeacherMessagesQueryParams,
  TeacherMessagesListResponse,
  TeacherMessageResponse,
  TeacherNotesQueryParams,
  TeacherNotesListResponse,
  TeacherNoteResponse,
} from '@/services/api/types/teacher-requests.types';

// ============================================================================
// Helpers
// ============================================================================

/** Serialize query params, skipping null/undefined/empty values. */
const serializeParams = (params?: Record<string, unknown>) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

/** Inject the current school branch when one is not explicitly provided. */
const withSchoolBranch = <T extends { SchoolBranchId?: string }>(params?: T): T => {
  const schoolBranchId = getCurrentSchoolBranchId();
  return {
    ...(params ?? ({} as T)),
    SchoolBranchId: params?.SchoolBranchId || schoolBranchId || undefined,
  };
};

// ============================================================================
// Summary
// ============================================================================

export async function getTeacherRequestsSummary(
  params?: TeacherRequestsSummaryParams
): Promise<TeacherRequestsSummaryResponse> {
  const response: AxiosResponse<TeacherRequestsSummaryResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getSummary,
    { params: withSchoolBranch(params), paramsSerializer: { serialize: serializeParams } }
  );
  return response.data;
}

// ============================================================================
// Apply Job Advertisement
// ============================================================================

export async function getJobApplications(
  params?: JobApplicationsQueryParams
): Promise<JobApplicationsListResponse> {
  const response: AxiosResponse<JobApplicationsListResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getJobApplications,
    { params: withSchoolBranch(params), paramsSerializer: { serialize: serializeParams } }
  );
  return response.data;
}

export async function getJobApplicationById(
  applicationJobAdvertismentId: string
): Promise<JobApplicationResponse> {
  const response: AxiosResponse<JobApplicationResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getJobApplicationById(applicationJobAdvertismentId)
  );
  return response.data;
}

// ============================================================================
// Early Leave
// ============================================================================

export async function getEarlyLeaves(
  params?: EarlyLeaveQueryParams
): Promise<EarlyLeavesListResponse> {
  const response: AxiosResponse<EarlyLeavesListResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getEarlyLeaves,
    { params: withSchoolBranch(params), paramsSerializer: { serialize: serializeParams } }
  );
  return response.data;
}

export async function getEarlyLeaveById(id: string): Promise<EarlyLeaveResponse> {
  const response: AxiosResponse<EarlyLeaveResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getEarlyLeaveById(id)
  );
  return response.data;
}

export async function updateEarlyLeaveStatus(
  body: UpdateEarlyLeaveStatusRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    TeacherRequestsEndpoints.updateEarlyLeaveStatus,
    body
  );
  return response.data;
}

// ============================================================================
// Messages
// ============================================================================

export async function getTeacherMessages(
  params?: TeacherMessagesQueryParams
): Promise<TeacherMessagesListResponse> {
  const response: AxiosResponse<TeacherMessagesListResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getMessages,
    { params: withSchoolBranch(params), paramsSerializer: { serialize: serializeParams } }
  );
  return response.data;
}

export async function getTeacherMessageById(id: string): Promise<TeacherMessageResponse> {
  const response: AxiosResponse<TeacherMessageResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getMessageById(id)
  );
  return response.data;
}

export async function markTeacherMessageAsViewed(id: string): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    TeacherRequestsEndpoints.markMessageAsViewed(id)
  );
  return response.data;
}

// ============================================================================
// Notes
// ============================================================================

export async function getTeacherNotes(
  params?: TeacherNotesQueryParams
): Promise<TeacherNotesListResponse> {
  const response: AxiosResponse<TeacherNotesListResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getNotes,
    { params: withSchoolBranch(params), paramsSerializer: { serialize: serializeParams } }
  );
  return response.data;
}

export async function getTeacherNoteById(id: string): Promise<TeacherNoteResponse> {
  const response: AxiosResponse<TeacherNoteResponse> = await axiosClient.get(
    TeacherRequestsEndpoints.getNoteById(id)
  );
  return response.data;
}

export async function markTeacherNoteAsViewed(id: string): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    TeacherRequestsEndpoints.markNoteAsViewed(id)
  );
  return response.data;
}

// ============================================================================
// Export
// ============================================================================

export const teacherRequestsApiService = {
  getTeacherRequestsSummary,
  getJobApplications,
  getJobApplicationById,
  getEarlyLeaves,
  getEarlyLeaveById,
  updateEarlyLeaveStatus,
  getTeacherMessages,
  getTeacherMessageById,
  markTeacherMessageAsViewed,
  getTeacherNotes,
  getTeacherNoteById,
  markTeacherNoteAsViewed,
};

export default teacherRequestsApiService;
