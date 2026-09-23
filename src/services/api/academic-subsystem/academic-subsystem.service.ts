import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { AcademicSubSystemEndpoints } from '../endpoints/academic-subsystem-endpoints';
import type {
  AcademicSubSystemDetailsValue,
  AcademicSubSystemListValue,
  CreateAcademicSubSystem,
  UpdateAcademicSubSystemRequest,
  AcademicSubSystemParams,
} from '../types/academic-subsystem.types';
import type { ApiResponseModel } from '../config';

export async function getAcademicSubSystems(
  params?: AcademicSubSystemParams
): Promise<AcademicSubSystemListValue> {
  const response: AxiosResponse<ApiResponseModel<AcademicSubSystemListValue>> =
    await axiosClient.get(AcademicSubSystemEndpoints.getAcademicSubSystem, { params });

  return response.data.value;
}

export async function getAcademicSubSystemById(id: string): Promise<AcademicSubSystemDetailsValue> {
  const response: AxiosResponse<ApiResponseModel<AcademicSubSystemDetailsValue>> =
    await axiosClient.get(AcademicSubSystemEndpoints.getAcademicSubSystemById(id));

  return response.data.value;
}

export async function createAcademicSubSystem(
  data: CreateAcademicSubSystem
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    AcademicSubSystemEndpoints.addAcademicSubSystem,
    data
  );

  return response.data;
}

export async function updateAcademicSubSystem(
  data: UpdateAcademicSubSystemRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    AcademicSubSystemEndpoints.editAcademicSubSystem,
    data
  );

  return response.data;
}

export async function deleteAcademicSubSystem(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    AcademicSubSystemEndpoints.deleteAcademicSubSystem(id)
  );

  return response.data;
}

export const AcademicSubSystemsApiService = {
  getAcademicSubSystems,
  getAcademicSubSystemById,
  createAcademicSubSystem,
  updateAcademicSubSystem,
  deleteAcademicSubSystem,
};

export default AcademicSubSystemsApiService;
