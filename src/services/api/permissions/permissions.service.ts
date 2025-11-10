import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { PermissionsEndpoints } from '../endpoints/permissions-endpoints';
import type {
  PermissionsListResponse,
  PermissionsQueryParams,
} from '@/services/api/types/permissions.types';
import type { ApiResponseModel } from '../config';

/**
 * Get all permissions with optional pagination
 */
export async function getPermissions(
  params?: PermissionsQueryParams
): Promise<PermissionsListResponse> {
  const response: AxiosResponse<ApiResponseModel<PermissionsListResponse>> = await axiosClient.get(
    PermissionsEndpoints.getPermissions,
    { params }
  );

  if (!response?.data?.value) {
    return {
      permissionGroupDtos: [],
      pageIndex: params?.PageIndex || 1,
      totalPages: 0,
      totalItems: 0,
      pageSize: params?.PageSize || 10,
    };
  }

  return response.data.value;
}

export const permissionsApiService = {
  getPermissions,
};

export default permissionsApiService;
