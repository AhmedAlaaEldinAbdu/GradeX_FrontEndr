/**
 * Students API Service
 * Handles all API calls related to student management
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { StudentEndpoints } from '../endpoints/students-endpoints';
import type { StudentDto, StudentListResponse, StudentQueryParams } from '../types/students.types';
import type { ApiResponseModel } from '../config';

/**
 * Get list of students with pagination and filters
 */
export async function getStudents(params?: StudentQueryParams): Promise<StudentListResponse> {
  const response: AxiosResponse<StudentListResponse> = await axiosClient.get(
    StudentEndpoints.getStudents,
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
        studentDto: [],
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
 * Get student by ID
 */
export async function getStudentById(id: string): Promise<StudentDto> {
  const response: AxiosResponse<ApiResponseModel<StudentDto>> = await axiosClient.get(
    StudentEndpoints.getStudentById(id)
  );

  if (response.data.data) {
    return response.data.data;
  }

  return response.data.value as StudentDto;
}

export async function deleteStudent(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    StudentEndpoints.deleteStudent(id)
  );
  return response.data;
}

export const studentsApiService = {
  getStudents,
  getStudentById,
  deleteStudent,
};

export default studentsApiService;
