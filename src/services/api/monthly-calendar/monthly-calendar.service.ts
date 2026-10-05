/**
 * Monthly Calendar API Service
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { MonthlyCalendarEndpoints } from '../endpoints/monthly-calendar-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  MonthlyCalendarListResponse,
  MonthlyCalendarQueryParams,
  MonthlyCalendarDashboardParams,
  MonthlyCalendarDashboardResponse,
  MonthlyCalendarEvent,
  CreateMonthlyCalendarRequest,
  UpdateMonthlyCalendarRequest,
} from '../types/monthly-calendar.types';

const serializeParams = (params?: MonthlyCalendarQueryParams) => {
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

export async function getMonthlyCalendarEvents(
  params?: MonthlyCalendarQueryParams
): Promise<MonthlyCalendarListResponse> {
  const response: AxiosResponse<MonthlyCalendarListResponse> = await axiosClient.get(
    MonthlyCalendarEndpoints.getMonthlyEvents,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        monthlyCalendarDto: [],
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

export async function getMonthlyCalendarDashboardEvents(
  params: MonthlyCalendarDashboardParams
): Promise<MonthlyCalendarEvent[]> {
  const response: AxiosResponse<MonthlyCalendarDashboardResponse> = await axiosClient.get(
    MonthlyCalendarEndpoints.getMonthlyDashboardEvents,
    { params }
  );

  return response.data.data?.monthlyCalendarDto ?? [];
}

export async function getMonthlyCalendarEventById(id: string): Promise<MonthlyCalendarEvent> {
  const response: AxiosResponse<ApiResponseModel<MonthlyCalendarEvent>> = await axiosClient.get(
    MonthlyCalendarEndpoints.getMonthlyEventById(id)
  );

  if (response.data.data) {
    return response.data.data;
  }

  return response.data.value as MonthlyCalendarEvent;
}

export async function createMonthlyCalendarEvent(
  data: CreateMonthlyCalendarRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    MonthlyCalendarEndpoints.addMonthlyEvent,
    data
  );

  return response.data;
}

export async function updateMonthlyCalendarEvent(
  id: string,
  data: UpdateMonthlyCalendarRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    MonthlyCalendarEndpoints.editMonthlyEvent,
    data,
    {
      params: { Id: id },
    }
  );

  return response.data;
}

export async function deleteMonthlyCalendarEvent(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    MonthlyCalendarEndpoints.deleteMonthlyEvent(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'Monthly calendar event deleted successfully',
  };
}

export const monthlyCalendarApiService = {
  getMonthlyCalendarEvents,
  getMonthlyCalendarDashboardEvents,
  getMonthlyCalendarEventById,
  createMonthlyCalendarEvent,
  updateMonthlyCalendarEvent,
  deleteMonthlyCalendarEvent,
};

export default monthlyCalendarApiService;
