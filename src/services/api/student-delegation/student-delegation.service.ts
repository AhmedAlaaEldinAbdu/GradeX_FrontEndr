import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { StudentDelegationEndpoints } from '../endpoints/student-delegation-endpoints';
import type {
  StudentDelegationListResponse,
  StudentDelegationDetailResponse,
  StudentDelegationQueryParams,
  CreateStudentDelegationRequest,
  UpdateStudentDelegationRequest,
} from '../types/student-delegation.types';

/**
 * Build multipart/form-data from a create/update payload.
 * File fields are appended only when provided; empty values are skipped.
 */
function toFormData(
  data: CreateStudentDelegationRequest | UpdateStudentDelegationRequest
): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * Get list of student delegations with pagination, filtered by student.
 */
export async function getStudentDelegations(
  params?: StudentDelegationQueryParams
): Promise<StudentDelegationListResponse> {
  const response: AxiosResponse<StudentDelegationListResponse> = await axiosClient.get(
    StudentDelegationEndpoints.list,
    { params }
  );

  if (!response?.data?.data) {
    return {
      data: {
        studentDelegations: [],
        pageIndex: params?.PageIndex || 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: params?.PageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

/**
 * Get a single student delegation by ID.
 */
export async function getStudentDelegationById(
  id: string
): Promise<StudentDelegationDetailResponse> {
  const response: AxiosResponse<StudentDelegationDetailResponse> = await axiosClient.get(
    StudentDelegationEndpoints.getById(id)
  );

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Student delegation not found');
  }

  return response.data;
}

/**
 * Create a new student delegation.
 */
export async function createStudentDelegation(
  data: CreateStudentDelegationRequest
): Promise<StudentDelegationDetailResponse> {
  const response: AxiosResponse<StudentDelegationDetailResponse> = await axiosClient.post(
    StudentDelegationEndpoints.create,
    toFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to create student delegation');
  }

  return response.data;
}

/**
 * Update an existing student delegation.
 */
export async function updateStudentDelegation(
  data: UpdateStudentDelegationRequest
): Promise<StudentDelegationDetailResponse> {
  const response: AxiosResponse<StudentDelegationDetailResponse> = await axiosClient.put(
    StudentDelegationEndpoints.update,
    toFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to update student delegation');
  }

  return response.data;
}

/**
 * Delete a student delegation by ID.
 */
export async function deleteStudentDelegation(id: string): Promise<{ success: boolean }> {
  const response: AxiosResponse<{ isSuccess: boolean; message: string }> = await axiosClient.delete(
    StudentDelegationEndpoints.delete(id)
  );

  return { success: !!response?.data?.isSuccess };
}

// ============================================================================
// Export Service Object
// ============================================================================

export const studentDelegationApiService = {
  getStudentDelegations,
  getStudentDelegationById,
  createStudentDelegation,
  updateStudentDelegation,
  deleteStudentDelegation,
};

export default studentDelegationApiService;
