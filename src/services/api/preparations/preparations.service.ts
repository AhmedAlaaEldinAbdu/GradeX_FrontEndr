import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { PreparationEndpoints } from '../endpoints/preparations.endpoints';
import type { PreparationListResponse, PreparationQueryParams } from '@/types/preparations';

/**
 * Get list of preparations with pagination and filters
 */
export async function getPreparations(
  params?: PreparationQueryParams
): Promise<PreparationListResponse> {
  const response: AxiosResponse<PreparationListResponse> = await axiosClient.get(
    PreparationEndpoints.getPreparations,
    {
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
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        preparations: [],
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

export const preparationApiService = {
  getPreparations,
};

export default preparationApiService;
