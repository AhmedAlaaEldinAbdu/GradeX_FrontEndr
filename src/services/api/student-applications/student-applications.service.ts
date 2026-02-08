import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import type { ApiResponseModel } from '../config';
import type {
  StudentApplicationListResponse,
  StudentApplicationQueryParams,
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

export const studentApplicationsApiService = {
  getStudentApplications,
};

export default studentApplicationsApiService;
