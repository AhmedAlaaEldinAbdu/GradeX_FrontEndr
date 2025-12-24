import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { TeacherAttendanceEndpoints } from '../endpoints/teacher-attendance-endpoints';
import type {
  TeacherAttendanceListResponse,
  TeacherAttendanceQueryParams,
  TeacherAttendanceListData,
  BulkAttendanceRequest,
} from '@/types/teacherAttendance';
import type {
  TeacherAttendanceDetailResponse,
  TeacherAttendanceDetailQueryParams,
} from '@/types/teacherAttendanceDetail';

/**
 * Get list of teacher attendance by branch with pagination and filters
 */
export async function getTeacherAttendanceByBranch(
  params: TeacherAttendanceQueryParams
): Promise<TeacherAttendanceListResponse> {
  const response: AxiosResponse<TeacherAttendanceListData> = await axiosClient.get(
    TeacherAttendanceEndpoints.getByBranch,
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

  if (!response?.data) {
    return {
      data: {
        teachersAttends: [],
        totalItems: 0,
        totalPages: 0,
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return {
    data: response.data,
    isSuccess: true,
    message: '',
    validationErrors: null,
  };
}

/**
 * Get list of teacher attendance records for a specific teacher
 */
export async function getTeacherAttendanceByTeacher(
  params: TeacherAttendanceDetailQueryParams
): Promise<TeacherAttendanceDetailResponse> {
  const response: AxiosResponse<TeacherAttendanceDetailResponse> = await axiosClient.get(
    TeacherAttendanceEndpoints.getByTeacher,
    {
      params,
    }
  );

  if (!response?.data) {
    return {
      attendances: [],
      totalAttendance: 0,
      totalAbsence: 0,
      totalLate: 0,
      pageIndex: params?.PageIndex || 1,
      totalPages: 0,
      totalItems: 0,
      pageSize: params?.PageSize || 10,
    };
  }

  return response.data;
}

/**
 * Bulk create teacher attendance records
 */
export async function bulkCreateAttendance(data: BulkAttendanceRequest): Promise<void> {
  const response: AxiosResponse<{
    data: null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.post(TeacherAttendanceEndpoints.bulkCreate, data);

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to bulk create attendance');
  }
}

// ============================================================================
// Export Service Object
// ============================================================================

export const teacherAttendanceApiService = {
  getTeacherAttendanceByBranch,
  getTeacherAttendanceByTeacher,
  bulkCreateAttendance,
};
