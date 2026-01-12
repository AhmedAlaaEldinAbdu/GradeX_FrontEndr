/**
 * Academic Calendar API Service
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { AcademicCalendarEndpoints } from '../endpoints/academic-calendar-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  AcademicCalendarEntity,
  AcademicCalendarListResponse,
  AcademicCalendarQueryParams,
  CreateAcademicCalendarRequest,
  UpdateAcademicCalendarRequest,
} from '../types/academic-calendar.types';

const serializeParams = (params?: AcademicCalendarQueryParams) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

export async function getAcademicCalendars(
  params?: AcademicCalendarQueryParams
): Promise<AcademicCalendarListResponse> {
  const response: AxiosResponse<AcademicCalendarListResponse> = await axiosClient.get(
    AcademicCalendarEndpoints.getAcademicCalendars,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  // Keep return shape consistent even if backend returns empty body.
  if (!response?.data?.data && !response?.data?.value) {
    return {
      data: {
        academicCalendarDto: [],
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

export async function getAcademicCalendarById(id: string): Promise<AcademicCalendarEntity> {
  const response: AxiosResponse<ApiResponseModel<AcademicCalendarEntity>> = await axiosClient.get(
    AcademicCalendarEndpoints.getAcademicCalendarById(id)
  );

  if (response.data.data) {
    return response.data.data;
  }

  return response.data.value as AcademicCalendarEntity;
}

export async function createAcademicCalendar(
  data: CreateAcademicCalendarRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    AcademicCalendarEndpoints.addAcademicCalendar,
    data
  );

  return response.data;
}

export async function updateAcademicCalendar(
  id: string,
  data: UpdateAcademicCalendarRequest
): Promise<ApiResponseModel<null>> {
  const payload: UpdateAcademicCalendarRequest = {
    ...data,
    id: data.id ?? id,
  };

  // Swagger shows PUT without route param; we also pass Id as query param (like other endpoints).
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    AcademicCalendarEndpoints.editAcademicCalendar,
    payload,
    {
      params: { Id: id },
    }
  );

  return response.data;
}

export async function deleteAcademicCalendar(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    AcademicCalendarEndpoints.deleteAcademicCalendar(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'Academic calendar deleted successfully',
  };
}

export const academicCalendarApiService = {
  getAcademicCalendars,
  getAcademicCalendarById,
  createAcademicCalendar,
  updateAcademicCalendar,
  deleteAcademicCalendar,
};

export default academicCalendarApiService;
