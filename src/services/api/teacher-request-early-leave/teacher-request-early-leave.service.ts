/**
 * TeacherRequestEarlyLeave API Service
 * Handles all API calls for the TeacherRequestEarlyLeave controller.
 */
import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import { TeacherRequestEarlyLeaveEndpoints } from '../endpoints/teacher-request-early-leave-endpoints';
import type {
  GetEarlyLeavesQueryParams,
  CreateEarlyLeaveRequest,
  UpdateEarlyLeaveRequest,
  DeleteEarlyLeaveRequest,
  GetEarlyLeavesResponse,
  GetEarlyLeaveByIdResponse,
  CreateEarlyLeaveResponse,
  UpdateEarlyLeaveResponse,
  DeleteEarlyLeaveResponse,
} from '../types/teacher-request-early-leave.types';

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
// Get Early Leave Requests (List)
// ============================================================================

export async function getEarlyLeaves(
  params?: GetEarlyLeavesQueryParams
): Promise<GetEarlyLeavesResponse> {
  const response: AxiosResponse<GetEarlyLeavesResponse> = await axiosClient.get(
    TeacherRequestEarlyLeaveEndpoints.getEarlyLeaves,
    { params: withSchoolBranch(params), paramsSerializer: { serialize: serializeParams } }
  );
  return response.data;
}

// ============================================================================
// Get Early Leave Request Details
// ============================================================================

export async function getEarlyLeaveById(id: string): Promise<GetEarlyLeaveByIdResponse> {
  const response: AxiosResponse<GetEarlyLeaveByIdResponse> = await axiosClient.get(
    TeacherRequestEarlyLeaveEndpoints.getEarlyLeaveById(id)
  );
  return response.data;
}

// ============================================================================
// Create Early Leave Request
// ============================================================================

export async function createEarlyLeave(
  data: CreateEarlyLeaveRequest
): Promise<CreateEarlyLeaveResponse> {
  const formData = new FormData();

  // Add all fields to FormData
  formData.append('TeacherId', data.TeacherId);
  formData.append('SchoolBranchId', data.SchoolBranchId);
  formData.append('Date', data.Date instanceof Date ? data.Date.toISOString() : String(data.Date));
  formData.append('FromTime', data.FromTime);
  formData.append('ToTime', data.ToTime);
  formData.append('Reason', data.Reason);

  // Add optional attachment file
  if (data.Attachment) {
    formData.append('Attachment', data.Attachment);
  }

  const response: AxiosResponse<CreateEarlyLeaveResponse> = await axiosClient.post(
    TeacherRequestEarlyLeaveEndpoints.createEarlyLeave,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

// ============================================================================
// Update Early Leave Request
// ============================================================================

export async function updateEarlyLeave(
  data: UpdateEarlyLeaveRequest
): Promise<UpdateEarlyLeaveResponse> {
  const formData = new FormData();

  // Add all fields to FormData
  formData.append('Id', data.Id);
  formData.append('TeacherId', data.TeacherId);
  formData.append('SchoolBranchId', data.SchoolBranchId);
  formData.append('Date', data.Date instanceof Date ? data.Date.toISOString() : String(data.Date));
  formData.append('FromTime', data.FromTime);
  formData.append('ToTime', data.ToTime);
  formData.append('Reason', data.Reason);

  // Add optional attachment file
  if (data.Attachment) {
    formData.append('Attachment', data.Attachment);
  }

  const response: AxiosResponse<UpdateEarlyLeaveResponse> = await axiosClient.put(
    TeacherRequestEarlyLeaveEndpoints.updateEarlyLeave,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

// ============================================================================
// Delete Early Leave Request
// ============================================================================

export async function deleteEarlyLeave(id: string): Promise<DeleteEarlyLeaveResponse> {
  const requestBody: DeleteEarlyLeaveRequest = { Id: id };

  const response: AxiosResponse<DeleteEarlyLeaveResponse> = await axiosClient.delete(
    TeacherRequestEarlyLeaveEndpoints.deleteEarlyLeave,
    {
      data: requestBody,
    }
  );
  return response.data;
}

// ============================================================================
// Export
// ============================================================================

export const teacherRequestEarlyLeaveApiService = {
  getEarlyLeaves,
  getEarlyLeaveById,
  createEarlyLeave,
  updateEarlyLeave,
  deleteEarlyLeave,
};

export default teacherRequestEarlyLeaveApiService;
