import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { UsersEndpoints } from '../endpoints/users-endpoints';
import type {
  User,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  UserQueryParams,
  AssignSchoolRoleRequest,
} from '@/services/api/types/users.types';
import type { ApiResponseModel } from '../config';

/**
 * Get list of users with pagination and filters
 */
export async function getUsers(params?: UserQueryParams): Promise<UserListResponse> {
  const apiParams: Record<string, string | number> = {};

  if (params?.searchTerm || params?.Search) {
    apiParams.Search = params.searchTerm || params.Search || '';
  }
  if (params?.roleId) {
    apiParams.roleId = params.roleId;
  }
  if (params?.lkCountryId) {
    apiParams.LkCountryId = params.lkCountryId;
  }
  if (params?.pageIndex || params?.PageNumber) {
    apiParams.PageNumber = params.pageIndex || params.PageNumber || 1;
  }
  if (params?.pageSize || params?.PageSize) {
    apiParams.PageSize = params.pageSize || params.PageSize || 10;
  }
  if (params?.SchoolBranchId) {
    apiParams.SchoolBranchId = params.SchoolBranchId;
  }

  const response: AxiosResponse<
    ApiResponseModel<{
      items: User[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      totalPages: number;
    }>
  > = await axiosClient.get(UsersEndpoints.getAllUsers, { params: apiParams });

  if (!response?.data?.value) {
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      pageIndex: params?.pageIndex || params?.PageNumber || 1,
      pageSize: params?.pageSize || params?.PageSize || 10,
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
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User> {
  const response: AxiosResponse<ApiResponseModel<User>> = await axiosClient.get(
    UsersEndpoints.getUserById(id)
  );

  return response.data.value;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response: AxiosResponse<{ id: ApiResponseModel<User> }> = await axiosClient.post(
    UsersEndpoints.createUser,
    data
  );

  const responseData = response.data.id;

  if (
    !responseData.isSuccess &&
    responseData.validationErrors &&
    responseData.validationErrors.length > 0
  ) {
    const error = new Error('Validation failed') as Error & {
      validationErrors: typeof responseData.validationErrors;
      isValidationError: boolean;
    };
    error.validationErrors = responseData.validationErrors;
    error.isValidationError = true;
    throw error;
  }

  return responseData.value;
}

/**
 * Update an existing user
 */
export async function updateUser(data: UpdateUserRequest): Promise<User> {
  const response: AxiosResponse<ApiResponseModel<User>> = await axiosClient.put(
    UsersEndpoints.updateUser,
    data
  );

  const responseData = response.data;

  if (
    !responseData.isSuccess &&
    responseData.validationErrors &&
    responseData.validationErrors.length > 0
  ) {
    const error = new Error('Validation failed') as Error & {
      validationErrors: typeof responseData.validationErrors;
      isValidationError: boolean;
    };
    error.validationErrors = responseData.validationErrors;
    error.isValidationError = true;
    throw error;
  }

  return responseData.value;
}

/**
 * Delete a user
 */
export async function deleteUser(data: DeleteUserRequest): Promise<{ success: boolean }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    UsersEndpoints.deleteUser,
    { data }
  );

  return { success: response.data.isSuccess };
}

/**
 * Assign one or more school roles to a user
 */
export async function assignSchoolRole(
  data: AssignSchoolRoleRequest
): Promise<{ success: boolean }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.post(
    UsersEndpoints.assignSchoolRole,
    data
  );

  if (!response.data.isSuccess) {
    const error = new Error(response.data.message || 'Failed to assign role') as Error & {
      validationErrors?: typeof response.data.validationErrors;
      isValidationError?: boolean;
    };
    if (response.data.validationErrors && response.data.validationErrors.length > 0) {
      error.validationErrors = response.data.validationErrors;
      error.isValidationError = true;
    }
    throw error;
  }

  return { success: response.data.isSuccess };
}

export const usersApiService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignSchoolRole,
};

export default usersApiService;
