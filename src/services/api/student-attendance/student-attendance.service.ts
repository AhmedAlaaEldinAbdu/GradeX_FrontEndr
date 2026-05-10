import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { StudentAttendanceEndpoints } from '../endpoints/student-attendance-endpoints';
import type {
  StudentAttendanceListResponse,
  StudentAttendanceQueryParams,
  StudentAttendanceListData,
  StudentBulkAttendanceRequest,
  StudentAttendanceByStudentData,
  StudentAttendanceByStudentQueryParams,
} from '@/types/studentAttendance';

/**
 * Get list of student attendance by branch with pagination and filters
 */
export async function getStudentAttendanceByBranch(
  params: StudentAttendanceQueryParams
): Promise<StudentAttendanceListResponse> {
  const response: AxiosResponse<StudentAttendanceListData> = await axiosClient.get(
    StudentAttendanceEndpoints.getByBranch,
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
        studentsAttends: [],
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
 * Bulk create student attendance records
 */
export async function bulkCreateStudentAttendance(
  data: StudentBulkAttendanceRequest
): Promise<void> {
  const response: AxiosResponse<{
    data: null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.post(StudentAttendanceEndpoints.bulkCreate, data);

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to bulk create student attendance');
  }
}

/**
 * Get attendance records for a single student
 */
export async function getStudentAttendanceByStudent(
  params: StudentAttendanceByStudentQueryParams
): Promise<StudentAttendanceByStudentData> {
  const response: AxiosResponse<StudentAttendanceByStudentData> = await axiosClient.get(
    StudentAttendanceEndpoints.getByStudent,
    { params }
  );

  return (
    response?.data ?? {
      attendances: [],
      totalAttendance: 0,
      totalAbsence: 0,
      totalLate: 0,
      pageIndex: params?.PageIndex || 1,
      totalPages: 0,
      totalItems: 0,
      pageSize: params?.PageSize || 10,
    }
  );
}

export const studentAttendanceApiService = {
  getStudentAttendanceByBranch,
  bulkCreateStudentAttendance,
  getStudentAttendanceByStudent,
};
