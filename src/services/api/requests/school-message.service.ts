/**
 * School Message API Service
 * Handles creating messages directed to students/classrooms (الرسائل).
 */
import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { SchoolMessageEndpoints } from '../endpoints/school-message-endpoints';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { ApiResponseModel } from '../config';
import type { CreateSchoolMessageRequest } from './requests.types';

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

export const schoolMessageApiService = {
  createSchoolMessage,
};

export default schoolMessageApiService;
