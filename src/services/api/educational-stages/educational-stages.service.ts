import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { EducationalStagesEndpoints } from '../endpoints/educational-stages-endpoints';
import type {
  EducationalStagesListValue,
  EducationalStageParams,
  EducationalStageResponse,
  CreateEducationalStageRequest,
  UpdateEducationalStageRequest,
} from '../types/educational-stages.types';
import type { ApiResponseModel } from '../config';

export async function fetchEducationalStages(
  params?: Partial<EducationalStageParams>
): Promise<EducationalStagesListValue> {
  const response: AxiosResponse<ApiResponseModel<EducationalStagesListValue>> = await axiosClient.get(
    EducationalStagesEndpoints.list,
    { params }
  );
  return response.data.value;
}

export async function fetchEducationalStagesBySubSystemId(
  academicSubSystemId: string,
  params?: Partial<Omit<EducationalStageParams, 'academicSubSystemId'>>
): Promise<EducationalStagesListValue> {
  const response: AxiosResponse<ApiResponseModel<EducationalStagesListValue>> = await axiosClient.get(
    EducationalStagesEndpoints.getBySubSystemId,
    { params: { academicSubSystemId, ...params } }
  );
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

export const EducationalStagesApiService = {
  fetchEducationalStages,
  fetchEducationalStagesBySubSystemId,
  fetchEducationalStageById,
  createEducationalStage,
  updateEducationalStage,
  deleteEducationalStage,
};

export default EducationalStagesApiService;
