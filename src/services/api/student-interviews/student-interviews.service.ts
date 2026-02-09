/**
 * Student Interview API Service
 * Provides typed wrappers around StudentInterview endpoints using Swagger contract.
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { StudentInterviewEndpoints } from '../endpoints/student-interview-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  CreateStudentInterviewRequest,
  StudentInterview,
  StudentInterviewListResponse,
  StudentInterviewQueryParams,
  UpdateStudentInterviewRequest,
} from '../types/student-interviews.types';

const serializeParams = (params?: StudentInterviewQueryParams) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export async function getStudentInterviews(
  params?: StudentInterviewQueryParams
): Promise<StudentInterviewListResponse> {
  const response: AxiosResponse<StudentInterviewListResponse> = await axiosClient.get(
    StudentInterviewEndpoints.getStudentInterviews,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        studentInterviewDto: [],
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

export async function getStudentInterviewById(id: string): Promise<StudentInterview> {
  const response: AxiosResponse<ApiResponseModel<StudentInterview>> = await axiosClient.get(
    StudentInterviewEndpoints.getStudentInterviewById(id)
  );

  if (response.data.data) {
    return response.data.data;
  }

  return response.data.value as StudentInterview;
}

export async function createStudentInterview(
  data: CreateStudentInterviewRequest | FormData
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    StudentInterviewEndpoints.addStudentInterview,
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

export async function updateStudentInterview(
  id: string,
  data: UpdateStudentInterviewRequest | FormData
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    StudentInterviewEndpoints.editStudentInterview,
    data,
    {
      params: { Id: id },
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

export async function deleteStudentInterview(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    StudentInterviewEndpoints.deleteStudentInterview(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'Student interview deleted successfully',
  };
}

export const studentInterviewsApiService = {
  getStudentInterviews,
  getStudentInterviewById,
  createStudentInterview,
  updateStudentInterview,
  deleteStudentInterview,
};

export default studentInterviewsApiService;
