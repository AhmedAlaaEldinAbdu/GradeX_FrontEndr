import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { OfficialHolidaysEndpoints } from '../endpoints/official-holidays-endpoints';
import type {
  OfficialHolidaysListResponse,
  OfficialHolidaysQueryParams,
} from '@/services/api/types/official-holidays.types';
import type { ApiResponseModel } from '../config';

/**
 * Get list of official holidays with pagination and filters
 */
export async function getOfficialHolidays(
  params?: OfficialHolidaysQueryParams
): Promise<OfficialHolidaysListResponse> {
  const response: AxiosResponse<ApiResponseModel<OfficialHolidaysListResponse>> =
    await axiosClient.get(OfficialHolidaysEndpoints.getOfficialHolidays, {
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

  if (!response?.data?.value) {
    return {
      leaveDto: [],
      totalItems: 0,
      totalPages: 0,
      pageIndex: params?.PageIndex || 1,
      pageSize: params?.PageSize || 10,
    };
  }

  return response.data.value;
}

/**
 * Create a new holiday
 */
export async function createHoliday(
  data: import('@/services/api/types/official-holidays.types').CreateOfficialHolidayRequest
): Promise<{ success: boolean; id?: string }> {
  const formData = new FormData();

  // Append required fields
  formData.append('StartDate', data.StartDate);
  formData.append('EndDate', data.EndDate);
  formData.append('LeaveCategory', data.LeaveCategory.toString());
  formData.append('Reason', data.Reason);
  formData.append('LKCountryId', data.LKCountryId);

  // Append optional file and metadata
  if (data.File) {
    formData.append('File', data.File);
    
    if (data.FileName) {
      formData.append('FileName', data.FileName);
    }
    
    if (data.FilePath) {
      formData.append('FilePath', data.FilePath);
    }
  }

  const response: AxiosResponse<ApiResponseModel<any>> = await axiosClient.post(
    OfficialHolidaysEndpoints.createHoliday,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    success: response.data.isSuccess,
    id: response.data.value?.id,
  };
}

/**
 * Update an existing holiday
 */
export async function updateHoliday(
  id: string,
  data: import('@/services/api/types/official-holidays.types').UpdateOfficialHolidayRequest
): Promise<{ success: boolean }> {
  const formData = new FormData();

  // Append required fields
  formData.append('StartDate', data.StartDate);
  formData.append('EndDate', data.EndDate);
  formData.append('LeaveCategory', data.LeaveCategory.toString());
  formData.append('Reason', data.Reason);
  formData.append('LKCountryId', data.LKCountryId);

  // Append optional file and metadata
  if (data.File) {
    formData.append('File', data.File);
    
    if (data.FileName) {
      formData.append('FileName', data.FileName);
    }
    
    if (data.FilePath) {
      formData.append('FilePath', data.FilePath);
    }
  }

  const response: AxiosResponse<ApiResponseModel<any>> = await axiosClient.put(
    OfficialHolidaysEndpoints.updateHoliday(id),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return { success: response.data.isSuccess };
}

/**
 * Delete a holiday
 */
export async function deleteHoliday(id: string): Promise<{ success: boolean }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    OfficialHolidaysEndpoints.deleteHoliday(id)
  );

  return { success: response.data.isSuccess };
}

export const officialHolidaysApiService = {
  getOfficialHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};

export default officialHolidaysApiService;
