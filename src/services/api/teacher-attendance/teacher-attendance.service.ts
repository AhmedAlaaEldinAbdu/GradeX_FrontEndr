import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { TeacherAttendanceEndpoints } from '../endpoints/teacher-attendance-endpoints';
import type {
  TeacherAttendanceListResponse,
  TeacherAttendanceQueryParams,
  TeacherAttendanceListData,
} from '@/types/teacherAttendance';

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

// ============================================================================
// Export Service Object
// ============================================================================

export const teacherAttendanceApiService = {
  getTeacherAttendanceByBranch,
};
