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

export const officialHolidaysApiService = {
  getOfficialHolidays,
};

export default officialHolidaysApiService;
