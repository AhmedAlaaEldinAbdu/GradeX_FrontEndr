import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { DailyReportEndpoints } from '../endpoints/daily-report-endpoints';
import type {
  DailyReportListResponse,
  DailyReportDetailResponse,
  DailyReportQueryParams,
  DailyReportByParentQueryParams,
  CreateDailyReportRequest,
  UpdateDailyReportRequest,
} from '../types/daily-report.types';

const serializeParams = (
  params?: DailyReportQueryParams | DailyReportByParentQueryParams
): string => {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams.toString();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

const emptyListResponse = (
  params?: DailyReportQueryParams | DailyReportByParentQueryParams
): DailyReportListResponse => ({
  isSuccess: false,
  message: '',
  data: {
    dailyReportDto: [],
    pageIndex: params?.PageIndex || 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: params?.PageSize || 10,
  },
  validationErrors: null,
});

/**
 * Get list of daily reports with pagination and filters.
 */
export async function getDailyReports(
  params?: DailyReportQueryParams
): Promise<DailyReportListResponse> {
  const response: AxiosResponse<DailyReportListResponse> = await axiosClient.get(
    DailyReportEndpoints.list,
    { params, paramsSerializer: { serialize: serializeParams } }
  );

  if (!response?.data?.data) {
    return emptyListResponse(params);
  }

  return response.data;
}

/**
 * Get daily reports for a parent's student within a date range.
 */
export async function getDailyReportsByParent(
  params?: DailyReportByParentQueryParams
): Promise<DailyReportListResponse> {
  const response: AxiosResponse<DailyReportListResponse> = await axiosClient.get(
    DailyReportEndpoints.byParent,
    { params, paramsSerializer: { serialize: serializeParams } }
  );

  if (!response?.data?.data) {
    return emptyListResponse(params);
  }

  return response.data;
}

/**
 * Get a single daily report by ID.
 */
export async function getDailyReportById(id: string): Promise<DailyReportDetailResponse> {
  const response: AxiosResponse<DailyReportDetailResponse> = await axiosClient.get(
    DailyReportEndpoints.getById(id)
  );

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Daily report not found');
  }

  return response.data;
}

/**
 * Create a new daily report.
 */
export async function createDailyReport(
  data: CreateDailyReportRequest
): Promise<DailyReportDetailResponse> {
  const response: AxiosResponse<DailyReportDetailResponse> = await axiosClient.post(
    DailyReportEndpoints.create,
    data
  );

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to create daily report');
  }

  return response.data;
}

/**
 * Update an existing daily report.
 */
export async function updateDailyReport(
  data: UpdateDailyReportRequest
): Promise<DailyReportDetailResponse> {
  const response: AxiosResponse<DailyReportDetailResponse> = await axiosClient.put(
    DailyReportEndpoints.update,
    data
  );

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to update daily report');
  }

  return response.data;
}

/**
 * Delete a daily report by ID.
 */
export async function deleteDailyReport(id: string): Promise<{ success: boolean }> {
  const response: AxiosResponse<{ isSuccess: boolean; message: string }> = await axiosClient.delete(
    DailyReportEndpoints.delete(id)
  );

  return { success: !!response?.data?.isSuccess };
}

// ============================================================================
// Export Service Object
// ============================================================================

export const dailyReportApiService = {
  getDailyReports,
  getDailyReportsByParent,
  getDailyReportById,
  createDailyReport,
  updateDailyReport,
  deleteDailyReport,
};

export default dailyReportApiService;
