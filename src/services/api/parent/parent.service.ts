import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { ParentEndpoints } from '../endpoints/parent-endpoints';
import type {
  ParentApiResponse,
  RegisterParentRequest,
  ParentLoginRequest,
  ParentResendOtpRequest,
  ParentConfirmOtpRequest,
  ParentChangePasswordRequest,
  ParentResetPasswordRequest,
  UpdateParentRequest,
  LikeFavoriteSchoolBranchRequest,
  DisLikeFavoriteSchoolBranchRequest,
  ParentProfile,
  ParentsByBranchResponse,
  ParentsByBranchQueryParams,
  DeleteParentAccountRequest,
} from '../types/parent.types';

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

/** Append defined values to FormData; File values are appended as binary. */
function toFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
}

// ============================================================================
// Auth / account
// ============================================================================

export async function registerParent(data: RegisterParentRequest): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.post(
    ParentEndpoints.register,
    data
  );
  return response.data;
}

export async function loginParent(data: ParentLoginRequest): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.post(
    ParentEndpoints.login,
    data
  );
  return response.data;
}

export async function resendParentOtp(data: ParentResendOtpRequest): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.post(
    ParentEndpoints.resendOtp,
    data
  );
  return response.data;
}

export async function confirmParentOtp(data: ParentConfirmOtpRequest): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.post(
    ParentEndpoints.confirmOtp,
    data
  );
  return response.data;
}

export async function changeParentPassword(
  data: ParentChangePasswordRequest
): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.post(
    ParentEndpoints.changePassword,
    data
  );
  return response.data;
}

export async function resetParentPassword(
  data: ParentResetPasswordRequest
): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.post(
    ParentEndpoints.resetPassword,
    data
  );
  return response.data;
}

// ============================================================================
// Profile
// ============================================================================

export async function updateParent(data: UpdateParentRequest): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.put(
    ParentEndpoints.update,
    toFormData(data as unknown as Record<string, unknown>),
    MULTIPART
  );
  return response.data;
}

export async function getParentProfile(): Promise<ParentApiResponse<ParentProfile | null>> {
  const response: AxiosResponse<ParentApiResponse<ParentProfile | null>> = await axiosClient.get(
    ParentEndpoints.getProfile
  );
  return response.data;
}

// ============================================================================
// Favorites
// ============================================================================

export async function likeFavoriteSchoolBranch(
  data: LikeFavoriteSchoolBranchRequest
): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.post(
    ParentEndpoints.likeFavorite,
    data
  );
  return response.data;
}

export async function dislikeFavoriteSchoolBranch(
  data: DisLikeFavoriteSchoolBranchRequest
): Promise<ParentApiResponse> {
  const response: AxiosResponse<ParentApiResponse> = await axiosClient.delete(
    ParentEndpoints.dislikeFavorite,
    { ...MULTIPART, data: toFormData(data as unknown as Record<string, unknown>) }
  );
  return response.data;
}

// ============================================================================
// Parents by branch
// ============================================================================

export async function getParentsByBranchId(
  schoolBranchId: string,
  params?: ParentsByBranchQueryParams
): Promise<ParentsByBranchResponse> {
  const response: AxiosResponse<ParentsByBranchResponse> = await axiosClient.get(
    ParentEndpoints.getByBranchId(schoolBranchId),
    { params }
  );

  if (!response?.data?.data) {
    return {
      data: {
        parents: [],
        pageIndex: params?.pageIndex || 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: params?.pageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

// ============================================================================
// Delete parent account
// ============================================================================

export async function deleteParentAccount(data: DeleteParentAccountRequest): Promise<void> {
  const response: AxiosResponse<{
    data: null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.delete(ParentEndpoints.deleteParentAccount, {
    data,
  });

  if (!response?.data?.isSuccess) {
    throw new Error(response?.data?.message || 'Failed to delete parent account');
  }
}

// ============================================================================
// Export Service Object
// ============================================================================

export const parentApiService = {
  registerParent,
  loginParent,
  resendParentOtp,
  confirmParentOtp,
  changeParentPassword,
  resetParentPassword,
  updateParent,
  getParentProfile,
  likeFavoriteSchoolBranch,
  dislikeFavoriteSchoolBranch,
  getParentsByBranchId,
  deleteParentAccount,
};

export default parentApiService;
