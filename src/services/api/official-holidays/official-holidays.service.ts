import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { OfficialHolidaysEndpoints } from '../endpoints/official-holidays-endpoints';
import type {
  OfficialHolidaysListResponse,
  OfficialHolidaysQueryParams,
  CreateOfficialHolidayRequest,
  UpdateOfficialHolidayRequest,
  CountriesWithLeaveResponse,
  CountriesWithLeaveQueryParams,
} from '@/services/api/types/official-holidays.types';
import type { ApiResponseModel } from '../config';

/**
 * Get list of countries with leave count
 */
export async function getCountriesWithLeave(
  params?: CountriesWithLeaveQueryParams
): Promise<CountriesWithLeaveResponse> {
  const response: AxiosResponse<ApiResponseModel<CountriesWithLeaveResponse>> =
    await axiosClient.get(OfficialHolidaysEndpoints.getCountriesWithLeave, {
      params,
    });

  if (!response?.data?.data) {
    return {
      countriesWithLeaves: [],
      totalItems: 0,
      totalPages: 0,
      pageIndex: params?.PageIndex || 1,
      pageSize: params?.PageSize || 10,
    };
  }

  return response.data.data;
}

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
  data: CreateOfficialHolidayRequest
): Promise<ApiResponseModel<any>> {
  const formData = new FormData();

  // Append required fields
  formData.append('StartDate', data.StartDate);
  formData.append('EndDate', data.EndDate);
  formData.append('LeaveCategory', data.LeaveCategory.toString());
  formData.append('ReasonInAr', data.ReasonInAr);
  formData.append('ReasonInEn', data.ReasonInEn);
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

  // Check if the request was successful
  if (!response.data.isSuccess) {
    // Throw error with the API error messages
    const errorMessage = response.data.errors?.join(', ') || 'Failed to create holiday';
    throw new Error(errorMessage);
  }

  return response.data;
}

/**
 * Update an existing holiday
 */
export async function updateHoliday(
  id: string,
  data: UpdateOfficialHolidayRequest
): Promise<ApiResponseModel<any>> {
  const formData = new FormData();

  // Append required fields
  formData.append('StartDate', data.StartDate);
  formData.append('EndDate', data.EndDate);
  formData.append('LeaveCategory', data.LeaveCategory.toString());
  formData.append('ReasonInAr', data.ReasonInAr);
  formData.append('ReasonInEn', data.ReasonInEn);
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

  if (!response.data.isSuccess) {
    const errorMessage = response.data.errors?.join(', ') || 'Failed to update holiday';
    throw new Error(errorMessage);
  }

  return response.data;
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
  getCountriesWithLeave,
  createHoliday,
  updateHoliday,
  deleteHoliday,
};

export default officialHolidaysApiService;
