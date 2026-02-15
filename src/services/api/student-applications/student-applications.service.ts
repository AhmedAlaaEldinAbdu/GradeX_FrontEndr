import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import type { ApiResponseModel } from '../config';
import type {
  StudentApplicationListResponse,
  StudentApplicationQueryParams,
  StudentApplicationDetailDto,
} from './student-applications.types';

export async function getStudentApplications(
  params?: StudentApplicationQueryParams
): Promise<ApiResponseModel<StudentApplicationListResponse>> {
  const response: AxiosResponse<ApiResponseModel<StudentApplicationListResponse>> =
    await axiosClient.get('/StudentApplication', {
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
    });

  if (!response?.data?.data) {
    return {
      data: {
        applicationDtos: [],
        totalItems: 0,
        totalPages: 0,
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
      },
      isSuccess: false,
      validationErrors: null,
      value: {
        applicationDtos: [],
        totalItems: 0,
        totalPages: 0,
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
      },
      status: 0,
      successMessage: '',
      correlationId: '',
      location: '',
      errors: [],
    };
  }

  return response.data;
}

export async function getStudentApplicationById(
  id: string
): Promise<ApiResponseModel<StudentApplicationDetailDto>> {
  const response: AxiosResponse<ApiResponseModel<StudentApplicationDetailDto>> =
    await axiosClient.get(`/StudentApplication/${id}`);

  return response.data;
}

export async function updateStudentApplicationStatus(
  id: string,
  status: number
): Promise<ApiResponseModel<boolean>> {
  const response: AxiosResponse<ApiResponseModel<boolean>> = await axiosClient.put(
    `/StudentApplication/UpdateStatus/${id}`,
    undefined,
    {
      params: { status },
    }
  );

  return response.data;
}

export async function sendEditRequest(
  studentApplicationId: string,
  editRequest: string
): Promise<ApiResponseModel<boolean>> {
  const response: AxiosResponse<ApiResponseModel<boolean>> = await axiosClient.put(
    '/StudentApplication/EditRequest',
    {
      studentApplication: studentApplicationId,
      editRequest,
    }
  );

  return response.data;
}

export const studentApplicationsApiService = {
  getStudentApplications,
  getStudentApplicationById,
  updateStudentApplicationStatus,
  sendEditRequest,
};

export default studentApplicationsApiService;
