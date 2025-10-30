/**
 * Schools API Service
 * Handles all API calls related to schools management using Axios
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { SchoolsEndpoints } from '../endpoints/schools-endpoints';
import type {
  SchoolDetail,
  SchoolListResponse,
  SchoolDetailResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolStatisticsResponse,
  BulkOperationResponse,
  SchoolQueryParams,
} from '@/services/api/types/school.types';
import type { ApiSuccessResponse, ApiResponseModel } from '../config';

// ============================================================================
// School CRUD Operations
// ============================================================================

/**
 * Get list of schools with pagination and filters
 */
export async function getSchools(params?: SchoolQueryParams): Promise<SchoolListResponse> {
  const response: AxiosResponse<ApiResponseModel<SchoolListResponse>> = await axiosClient.get(
    SchoolsEndpoints.getSchools,
    {
      params,
      paramsSerializer: {
        serialize: (params) => {
          const searchParams = new URLSearchParams();

          Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, String(v)));
            } else {
              searchParams.append(key, String(value));
            }
          });

          return searchParams.toString();
        },
      },
    }
  );

  // Handle null or undefined response
  if (!response?.data?.value) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      pageIndex: params?.pageIndex || 1,
      pageSize: params?.pageSize || 10,
    };
  }

  return response.data.value;
}

/**
 * Get school by ID
 */
export async function getSchoolById(id: string): Promise<SchoolDetail> {
  const response: AxiosResponse<ApiSuccessResponse<SchoolDetailResponse>> = await axiosClient.get(
    SchoolsEndpoints.getSchoolById(id)
  );

  return response.data.data.data;
}

/**
 * Create a new school
 */
export async function createSchool(data: CreateSchoolRequest | FormData): Promise<SchoolDetail> {
  const response: AxiosResponse<ApiResponseModel<SchoolDetailResponse>> = await axiosClient.post(
    SchoolsEndpoints.addSchool,
    data,
    {
      headers:
        data instanceof FormData
          ? {
              'Content-Type': 'multipart/form-data',
            }
          : undefined,
    }
  );

  // Check if the response indicates validation errors
  if (
    !response.data.isSuccess &&
    response.data.validationErrors &&
    response.data.validationErrors.length > 0
  ) {
    // Create a custom error that includes validation errors
    const error = new Error('Validation failed') as Error & {
      validationErrors: typeof response.data.validationErrors;
      isValidationError: boolean;
    };
    error.validationErrors = response.data.validationErrors;
    error.isValidationError = true;
    throw error;
  }

  return response.data.value.data;
}

/**
 * Update an existing school
 */
export async function updateSchool(id: string, data: UpdateSchoolRequest): Promise<SchoolDetail> {
  const response: AxiosResponse<ApiSuccessResponse<SchoolDetailResponse>> = await axiosClient.put(
    SchoolsEndpoints.editSchool(id),
    data
  );

  return response.data.data.data;
}

/**
 * Delete a school (soft delete)
 */
export async function deleteSchool(id: string): Promise<{ success: boolean }> {
  const response: AxiosResponse<ApiSuccessResponse<{ success: boolean }>> =
    await axiosClient.delete(SchoolsEndpoints.editSchool(id));

  return response.data.data;
}

/**
 * Restore a deleted school
 */
export async function restoreSchool(id: string): Promise<{ success: boolean }> {
  const response: AxiosResponse<ApiSuccessResponse<{ success: boolean }>> = await axiosClient.post(
    `${SchoolsEndpoints.editSchool(id)}/restore`
  );

  return response.data.data;
}

// ============================================================================
// School Status Management
// ============================================================================

/**
 * Update school status (activate/deactivate/approve/reject)
 */
export async function updateSchoolStatus(
  id: string,
  status: string,
  data?: { reason?: string; notes?: string }
): Promise<SchoolDetail> {
  const response: AxiosResponse<ApiSuccessResponse<SchoolDetailResponse>> = await axiosClient.patch(
    SchoolsEndpoints.editSchoolStatus(id),
    { status, ...data }
  );

  return response.data.data.data;
}

/**
 * Accept a school
 */
export async function acceptSchool(id: string): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.put(
    `${SchoolsEndpoints.editSchoolStatus(id)}?status=1`
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'UPDATED_SUCCESSFULLY',
  };
}

/**
 * Reject a school
 */
export async function rejectSchool(
  id: string,
  rejectionReason: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.put(
    `${SchoolsEndpoints.editSchoolStatus(id)}?status=2&rejectionReason=${encodeURIComponent(rejectionReason)}`
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'UPDATED_SUCCESSFULLY',
  };
}

/**
 * Add school update request
 */
export async function addSchoolUpdateRequest(
  id: string,
  data: UpdateSchoolRequest
): Promise<SchoolDetail> {
  const response: AxiosResponse<ApiSuccessResponse<SchoolDetailResponse>> = await axiosClient.post(
    SchoolsEndpoints.addSchoolRequest(id),
    data
  );

  return response.data.data.data;
}

/**
 * Get location filters (regions, states, cities)
 */
export async function getLocationFilters(): Promise<{
  regions: string[];
  states: string[];
  cities: string[];
}> {
  const response: AxiosResponse<
    ApiSuccessResponse<{
      regions: string[];
      states: string[];
      cities: string[];
    }>
  > = await axiosClient.get(SchoolsEndpoints.getLocationFilters);

  return response.data.data;
}

// ============================================================================
// Filtered Lists
// ============================================================================

/**
 * Get pending schools
 */
export async function getPendingSchools(params?: SchoolQueryParams): Promise<SchoolListResponse> {
  return getSchools({ ...params, schoolStatus: 3 });
}

/**
 * Get approved/registered schools
 */
export async function getApprovedSchools(params?: SchoolQueryParams): Promise<SchoolListResponse> {
  return getSchools({ ...params, schoolStatus: [1, 2] });
}

/**
 * Get rejected schools
 */
export async function getRejectedSchools(params?: SchoolQueryParams): Promise<SchoolListResponse> {
  return getSchools({ ...params, schoolStatus: 4 });
}

/**
 * Get active schools
 */
export async function getActiveSchools(params?: SchoolQueryParams): Promise<SchoolListResponse> {
  return getSchools({ ...params, schoolStatus: 1 });
}

/**
 * Get inactive schools
 */
export async function getInactiveSchools(params?: SchoolQueryParams): Promise<SchoolListResponse> {
  return getSchools({ ...params, schoolStatus: 2 });
}

/**
 * Get deleted schools
 */
export async function getDeletedSchools(params?: SchoolQueryParams): Promise<SchoolListResponse> {
  return getSchools({ ...params, schoolStatus: 4 });
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk delete schools
 */
export async function bulkDeleteSchools(ids: string[]): Promise<BulkOperationResponse> {
  const response: AxiosResponse<ApiSuccessResponse<BulkOperationResponse>> = await axiosClient.post(
    `${SchoolsEndpoints.getSchools}/bulk-delete`,
    { ids }
  );

  return response.data.data;
}

/**
 * Bulk approve schools
 */
export async function bulkApproveSchools(
  ids: string[],
  notes?: string
): Promise<BulkOperationResponse> {
  const response: AxiosResponse<ApiSuccessResponse<BulkOperationResponse>> = await axiosClient.post(
    `${SchoolsEndpoints.getSchools}/bulk-approve`,
    { ids, notes }
  );

  return response.data.data;
}

/**
 * Bulk reject schools
 */
export async function bulkRejectSchools(
  ids: string[],
  reason: string
): Promise<BulkOperationResponse> {
  const response: AxiosResponse<ApiSuccessResponse<BulkOperationResponse>> = await axiosClient.post(
    `${SchoolsEndpoints.getSchools}/bulk-reject`,
    { ids, reason }
  );

  return response.data.data;
}

// ============================================================================
// Statistics & Reports
// ============================================================================

/**
 * Get school statistics
 */
export async function getSchoolStatistics(): Promise<SchoolStatisticsResponse> {
  const response: AxiosResponse<ApiSuccessResponse<SchoolStatisticsResponse>> =
    await axiosClient.get(`${SchoolsEndpoints.getSchools}/statistics`);

  return response.data.data;
}

/**
 * Export schools data
 */
export async function exportSchools(
  format: 'csv' | 'excel' | 'pdf' = 'excel',
  filters?: SchoolQueryParams
): Promise<Blob> {
  const response: AxiosResponse<Blob> = await axiosClient.get(
    `${SchoolsEndpoints.getSchools}/export`,
    {
      params: { format, ...filters },
      responseType: 'blob',
    }
  );

  return response.data;
}

// ============================================================================
// File Upload
// ============================================================================

/**
 * Upload school logo
 */
export async function uploadSchoolLogo(file: File): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'logo');

  const response: AxiosResponse<ApiSuccessResponse<{ url: string; path: string }>> =
    await axiosClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

  return response.data.data;
}

/**
 * Upload school documents
 */
export async function uploadSchoolDocument(file: File): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'document');

  const response: AxiosResponse<ApiSuccessResponse<{ url: string; path: string }>> =
    await axiosClient.post('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

  return response.data.data;
}

/**
 * Bulk import schools from CSV/Excel
 */
export async function bulkImportSchools(file: File): Promise<BulkOperationResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response: AxiosResponse<ApiSuccessResponse<BulkOperationResponse>> = await axiosClient.post(
    '/upload/bulk',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
}

// ============================================================================
// Export All Services
// ============================================================================

export const schoolsApiService = {
  // CRUD
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  restoreSchool,

  // Status Management
  updateSchoolStatus,
  acceptSchool,
  rejectSchool,
  addSchoolUpdateRequest,
  getLocationFilters,

  // Filtered Lists
  getPendingSchools,
  getApprovedSchools,
  getRejectedSchools,
  getActiveSchools,
  getInactiveSchools,
  getDeletedSchools,

  // Bulk Operations
  bulkDeleteSchools,
  bulkApproveSchools,
  bulkRejectSchools,

  // Statistics & Reports
  getSchoolStatistics,
  exportSchools,

  // File Upload
  uploadSchoolLogo,
  uploadSchoolDocument,
  bulkImportSchools,
};

export default schoolsApiService;
