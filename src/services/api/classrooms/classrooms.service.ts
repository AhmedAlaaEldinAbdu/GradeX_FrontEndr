/**
 * Classroom API Service
 * Handles all API calls related to classroom management using Axios
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { ClassroomEndpoints } from '../endpoints/classroom-endpoints';
import type { ApiResponseModel } from '../config';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type {
  Classroom,
  ClassroomListResponse,
  ClassroomQueryParams,
  CreateClassroomRequest,
  UpdateClassroomRequest,
} from '@/services/api/types/classrooms.types';

// ============================================================================
// Classroom CRUD Operations
// ============================================================================

/**
 * Get list of classrooms with pagination and filters
 */
export async function getClassrooms(
  params?: Omit<ClassroomQueryParams, 'schoolBranchId'>
): Promise<ClassroomListResponse> {
  const schoolBranchId = getCurrentSchoolBranchId();
  const response: AxiosResponse<ClassroomListResponse> = await axiosClient.get(
    ClassroomEndpoints.getClassrooms,
    {
      params: { ...params, schoolBranchId },
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

  if (!response?.data?.data) {
    return {
      data: {
        classroomDto: [],
        totalItems: 0,
        totalPages: 0,
        pageIndex: params?.pageIndex || 1,
        pageSize: params?.pageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

/**
 * Get classroom by ID
 */
export async function getClassroomById(id: string): Promise<Classroom> {
  const response: AxiosResponse<ApiResponseModel<Classroom>> = await axiosClient.get(
    ClassroomEndpoints.getClassroomById(id)
  );

  // API returns data in the 'data' property
  if (response.data.data) {
    return response.data.data;
  }

  // Fallback to 'value' property if 'data' is not available
  return response.data.value;
}

/**
 * Create new classroom(s)
 */
export async function createClassroom(
  data: CreateClassroomRequest | FormData
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    ClassroomEndpoints.addClassroom,
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

  return response.data;
}

/**
 * Update an existing classroom
 */
export async function updateClassroom(
  data: UpdateClassroomRequest | FormData
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    ClassroomEndpoints.editClassroom,
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

  // API returns data in the 'data' property
  return response.data;
}

/**
 * Delete a classroom
 */
export async function deleteClassroom(id: string): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    ClassroomEndpoints.deleteClassroom(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'Classroom deleted successfully',
  };
}

// ============================================================================
// Export All Services
// ============================================================================

export const classroomApiService = {
  getClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
};

export default classroomApiService;
