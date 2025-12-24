import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { TeacherEndpoints, TeacherAssignmentEndpoints } from '../endpoints/teacher-endpoints';
import { TeacherAttendanceEndpoints } from '../endpoints/teacher-attendance-endpoints';
import type { Teacher, TeacherListResponse, TeacherQueryParams } from '@/types/teachers';
import type {
  TeacherAssignmentResponse,
  TeacherAssignmentData,
  TeacherAssignmentListResponse,
  TeacherAssignmentListData,
  TeacherAssignmentListQueryParams,
} from '@/types/teacherAssignment';
import type {
  TeacherPersonalDataResponse,
  TeacherPersonalDataDetails,
} from '@/types/teacherPersonalData';
import type { TeacherAttendanceUpdateRequest } from '@/types/teacherAttendance';

/**
 * Get list of teachers with pagination and filters
 */
export async function getTeachers(params?: TeacherQueryParams): Promise<TeacherListResponse> {
  const response: AxiosResponse<TeacherListResponse> = await axiosClient.get(
    TeacherEndpoints.getTeachers,
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

  if (!response?.data?.data) {
    return {
      data: {
        teachers: [],
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

  return response.data;
}

/**
 * Get teacher by ID
 */
export async function getTeacherById(id: string): Promise<Teacher> {
  const response: AxiosResponse<{
    data: Teacher;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.get(TeacherEndpoints.getTeacherById(id));

  return response.data.data;
}

/**
 * Delete a teacher assignment
 */
export async function deleteTeacher(id: string): Promise<void> {
  const response: AxiosResponse<{
    data: null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.delete(TeacherAssignmentEndpoints.deleteTeacherAssignment(id));

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to delete teacher assignment');
  }
}

/**
 * Get teacher educational stages and classrooms assignment
 */
export async function getTeacherAssignment(teacherId: string): Promise<TeacherAssignmentData> {
  const response: AxiosResponse<TeacherAssignmentResponse> = await axiosClient.get(
    TeacherAssignmentEndpoints.getAllTeacherClass,
    {
      params: { TeacherId: teacherId },
    }
  );

  if (!response?.data?.data) {
    return {
      gradeCount: 0,
      classRoomCount: 0,
      studentCount: 0,
      materailCount: 0,
      bookCount: 0,
      grades: [],
    };
  }

  return response.data.data;
}

/**
 * Get teacher personal data by ID
 */
export async function getTeacherPersonalData(id: string): Promise<TeacherPersonalDataDetails> {
  const response: AxiosResponse<TeacherPersonalDataResponse> = await axiosClient.get(
    TeacherEndpoints.getPersonalDataById,
    {
      params: { Id: id },
    }
  );

  if (!response?.data?.data) {
    throw new Error('Failed to fetch teacher personal data');
  }

  return response.data.data;
}

/**
 * Get teacher assignments list by school branch
 */
export async function getTeacherAssignmentList(
  params: TeacherAssignmentListQueryParams
): Promise<TeacherAssignmentListData> {
  const response: AxiosResponse<TeacherAssignmentListResponse> = await axiosClient.get(
    TeacherAssignmentEndpoints.getAll,
    { params }
  );

  if (!response?.data?.data) {
    return {
      teacherAssignmentDto: [],
      pageIndex: 1,
      totalPages: 0,
      totalItems: 0,
      pageSize: 10,
    };
  }

  return response.data.data;
}

/**
 * Update teacher attendance (preparation)
 */
export async function updateTeacherAttendance(data: TeacherAttendanceUpdateRequest): Promise<void> {
  const response: AxiosResponse<{
    data: null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.put(TeacherAttendanceEndpoints.updateAttendance, data);

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to update teacher attendance');
  }
}

// ============================================================================
// Export Service Object
// ============================================================================

export const teacherApiService = {
  getTeachers,
  getTeacherById,
  getTeacherPersonalData,
  deleteTeacher,
  getTeacherAssignment,
  getTeacherAssignmentList,
  updateTeacherAttendance,
};
