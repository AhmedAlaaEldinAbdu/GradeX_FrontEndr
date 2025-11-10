import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { RolesEndpoints } from '../endpoints/roles-endpoints';
import type {
  Role,
  RoleListResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleQueryParams,
} from '@/services/api/types/roles.types';
import type { ApiResponseModel } from '../config';

/**
 * Get list of roles with pagination and filters
 */
export async function getRoles(params?: RoleQueryParams): Promise<RoleListResponse> {
  const apiParams: Record<string, string | number> = {};

  if (params?.searchTerm) {
    apiParams.Search = params.searchTerm;
  }
  if (params?.pageIndex) {
    apiParams.PageNumber = params.pageIndex;
  }
  if (params?.pageSize) {
    apiParams.PageSize = params.pageSize;
  }

  const response: AxiosResponse<
    ApiResponseModel<{
      items: Role[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>
  > = await axiosClient.get(RolesEndpoints.getRoles, { params: apiParams });

  if (!response?.data?.value) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      pageIndex: params?.pageIndex || 1,
      pageSize: params?.pageSize || 10,
    };
  }

  const { items, totalCount, pageNumber, pageSize, totalPages } = response.data.value;

  return {
    items: items || [],
    totalItems: totalCount || 0,
    totalPages: totalPages || 0,
    pageIndex: pageNumber || 1,
    pageSize: pageSize || 10,
  };
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<Role> {
  const response: AxiosResponse<ApiResponseModel<Role>> = await axiosClient.get(
    RolesEndpoints.getRoleById(id)
  );

  return response.data.value;
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  const response: AxiosResponse<ApiResponseModel<Role>> = await axiosClient.post(
    RolesEndpoints.createRole,
    data
  );

  if (
    !response.data.isSuccess &&
    response.data.validationErrors &&
    response.data.validationErrors.length > 0
  ) {
    const error = new Error('Validation failed') as Error & {
      validationErrors: typeof response.data.validationErrors;
      isValidationError: boolean;
    };
    error.validationErrors = response.data.validationErrors;
    error.isValidationError = true;
    throw error;
  }

  return response.data.value;
}

/**
 * Update an existing role
 */
export async function updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
  const response: AxiosResponse<ApiResponseModel<Role>> = await axiosClient.put(
    RolesEndpoints.updateRole(id),
    data
  );

  return response.data.value;
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<{ success: boolean }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    RolesEndpoints.deleteRole(id)
  );

  return { success: response.data.isSuccess };
}

export const rolesApiService = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};

export default rolesApiService;
