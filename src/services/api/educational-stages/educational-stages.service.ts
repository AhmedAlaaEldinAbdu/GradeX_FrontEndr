import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { EducationalStagesEndpoints } from '../endpoints/educational-stages-endpoints';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type {
  EducationalStagesListValue,
  EducationalStageParams,
  EducationalStageResponse,
  LKSchoolStageResponse,
  CreateEducationalStageRequest,
  UpdateEducationalStageRequest,
} from '../types/educational-stages.types';
import type { ApiResponseModel } from '../config';

export async function fetchEducationalStages(
  params?: Partial<Omit<EducationalStageParams, 'schoolBranchId'>>
): Promise<EducationalStagesListValue> {
  const schoolBranchId = getCurrentSchoolBranchId();
  const response: AxiosResponse<ApiResponseModel<EducationalStagesListValue>> =
    await axiosClient.get(EducationalStagesEndpoints.base, {
      params: { ...params, schoolBranchId },
    });
  return response.data.value;
}

export async function fetchEducationalStagesBySubSystemId(
  academicSubSystemId: string,
  params?: Partial<Omit<EducationalStageParams, 'academicSubSystemId'>>
): Promise<EducationalStagesListValue> {
  const response: AxiosResponse<ApiResponseModel<EducationalStagesListValue>> =
    await axiosClient.get(EducationalStagesEndpoints.getGradeBySubSystemId, {
      params: { academicSubSystemId: academicSubSystemId, ...params },
    });
  return response.data.value;
}

export async function fetchEducationalStageById(id: string): Promise<EducationalStageResponse> {
  const response: AxiosResponse<ApiResponseModel<EducationalStageResponse>> = await axiosClient.get(
    EducationalStagesEndpoints.getById(id)
  );
  return response.data.value;
}

export async function createEducationalStage(
  data: CreateEducationalStageRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    EducationalStagesEndpoints.create,
    data
  );
  return response.data;
}

export async function updateEducationalStage(
  data: UpdateEducationalStageRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    EducationalStagesEndpoints.update,
    data
  );
  return response.data;
}

export async function deleteEducationalStage(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    EducationalStagesEndpoints.delete(id)
  );
  return response.data;
}

export async function fetchLKSchoolStages(): Promise<LKSchoolStageResponse[]> {
  const response: AxiosResponse<ApiResponseModel<LKSchoolStageResponse[]>> = await axiosClient.get(
    EducationalStagesEndpoints.lkSchoolStage
  );
  return response.data.value;
}

export const EducationalStagesApiService = {
  fetchEducationalStages,
  fetchEducationalStagesBySubSystemId,
  fetchEducationalStageById,
  createEducationalStage,
  updateEducationalStage,
  deleteEducationalStage,
  fetchLKSchoolStages,
};

export default EducationalStagesApiService;
