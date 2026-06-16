/**
 * School Message API Service
 * Handles creating messages directed to students/classrooms (الرسائل).
 */
import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { SchoolMessageEndpoints } from '../endpoints/school-message-endpoints';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { ApiResponseModel } from '../config';
import type {
  CreateSchoolMessageRequest,
  SchoolMessagesListResponse,
  SchoolMessagesQueryParams,
} from './requests.types';

/**
 * Create a school message.
 */
export async function createSchoolMessage(
  data: CreateSchoolMessageRequest
): Promise<ApiResponseModel<null>> {
  const schoolBranchId = getCurrentSchoolBranchId();
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    SchoolMessageEndpoints.create,
    data,
    { params: { schoolBranchId } }
  );
  return response.data;
}

/**
 * Get the paginated list of school messages.
 */
export async function getAllSchoolMessages(
  params?: SchoolMessagesQueryParams
): Promise<SchoolMessagesListResponse> {
  const SchoolBranchId = getCurrentSchoolBranchId();
  const response: AxiosResponse<ApiResponseModel<SchoolMessagesListResponse>> =
    await axiosClient.get(SchoolMessageEndpoints.getAll, {
      params: { SchoolBranchId, ...params },
    });

  const data = response.data.data ?? response.data.value;
  if (data) return data;

  return {
    messages: [],
    pageIndex: params?.PageIndex ?? 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: params?.PageSize ?? 10,
  };
}

export const schoolMessageApiService = {
  createSchoolMessage,
  getAllSchoolMessages,
};

export default schoolMessageApiService;
