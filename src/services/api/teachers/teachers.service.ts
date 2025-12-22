import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { TeacherEndpoints, TeacherAssignmentEndpoints } from '../endpoints/teacher-endpoints';
import type { Teacher, TeacherListResponse, TeacherQueryParams } from '@/types/teachers';
import type { TeacherAssignmentResponse, TeacherAssignmentData } from '@/types/teacherAssignment';

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
 * Delete a teacher
 */
export async function deleteTeacher(id: string): Promise<void> {
  await axiosClient.delete(TeacherEndpoints.deleteTeacher(id));
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

// ============================================================================
// Export Service Object
// ============================================================================

export const teacherApiService = {
  getTeachers,
  getTeacherById,
  deleteTeacher,
  getTeacherAssignment,
};
