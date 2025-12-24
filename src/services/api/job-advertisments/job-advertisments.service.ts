/**
 * Job Advertisment API Service
 * Wraps axios calls for the JobAdvertisment controller.
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { JobAdvertismentEndpoints } from '../endpoints/job-advertisment-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  JobAdvertismentListResponse,
  JobAdvertismentQueryParams,
  JobAdvertisment,
  CreateJobAdvertismentRequest,
  UpdateJobAdvertismentRequest,
  CreateJobAdvertismentRequestTwo,
} from '@/services/api/types/job-advertisment.types';

const serializeJobAdvertismentParams = (params?: JobAdvertismentQueryParams) => {
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

export async function getJobAdvertisments(
  params?: JobAdvertismentQueryParams
): Promise<JobAdvertismentListResponse> {
  const response: AxiosResponse<JobAdvertismentListResponse> = await axiosClient.get(
    JobAdvertismentEndpoints.getJobAdvertisments,
    {
      params,
      paramsSerializer: { serialize: serializeJobAdvertismentParams },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        jobAdvertismentDto: [],
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

export async function getJobAdvertismentById(id: string): Promise<JobAdvertisment> {
  const response: AxiosResponse<ApiResponseModel<JobAdvertisment>> = await axiosClient.get(
    JobAdvertismentEndpoints.getJobAdvertismentById(id)
  );

  if (response.data.data) {
    return response.data.data;
  }

  return response.data.value as JobAdvertisment;
}

export async function createJobAdvertisment(
  data: CreateJobAdvertismentRequestTwo
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    JobAdvertismentEndpoints.addJobAdvertisment,
    data
  );

  return response.data;
}

export async function updateJobAdvertisment(
  id: string,
  data: UpdateJobAdvertismentRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    JobAdvertismentEndpoints.editJobAdvertisment,
    data,
    {
      params: { Id: id },
    }
  );

  return response.data;
}

export async function deleteJobAdvertisment(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    JobAdvertismentEndpoints.deleteJobAdvertisment(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'Job advertisment deleted successfully',
  };
}

export const jobAdvertismentApiService = {
  getJobAdvertisments,
  getJobAdvertismentById,
  createJobAdvertisment,
  updateJobAdvertisment,
  deleteJobAdvertisment,
};

export default jobAdvertismentApiService;
