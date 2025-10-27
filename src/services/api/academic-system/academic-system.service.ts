import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { AcademicSystemEndpoints } from '../endpoints/academic-system-endpoints';
import type {
  AcademicSystemDetailsValue,
  AcademicSystemListValue,
  CreateAcademicSystem,
  UpdateAcademicSystemRequest,
  AcademicSubSystemParams,
} from '../types/academic-system.types';
import type { ApiResponseModel } from '../config';

export async function getAcademicSystem(
  params?: AcademicSubSystemParams
): Promise<AcademicSystemListValue> {
  const response: AxiosResponse<ApiResponseModel<AcademicSystemListValue>> = await axiosClient.get(
    AcademicSystemEndpoints.getAcademicSystem,
    { params }
  );

  return response.data.value;
}

export async function getAcademicSystemById(id: string): Promise<AcademicSystemDetailsValue> {
  const response: AxiosResponse<ApiResponseModel<AcademicSystemDetailsValue>> = await axiosClient.get(
    AcademicSystemEndpoints.getAcademicSystemById(id)
  );

  return response.data.value;
}

export async function createAcademicSystem(data: CreateAcademicSystem[]): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    AcademicSystemEndpoints.addAcademicSystem,
    data
  );

  return response.data;
}

export async function updateAcademicSystem(data: UpdateAcademicSystemRequest): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    AcademicSystemEndpoints.editAcademicSystem,
    data
  );

  return response.data;
}

export async function deleteAcademicSystem(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    AcademicSystemEndpoints.deleteAcademicSystem(id)
  );

  return response.data;
}

export const AcademicSystemsApiService = {
  getAcademicSystem,
  getAcademicSystemById,
  createAcademicSystem,
  updateAcademicSystem,
  deleteAcademicSystem,
};

export default AcademicSystemsApiService;
