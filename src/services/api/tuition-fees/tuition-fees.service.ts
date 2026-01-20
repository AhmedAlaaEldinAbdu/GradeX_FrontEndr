import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { TuitionFeesEndpoints } from '../endpoints/tuition-fees-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  TuitionFeesDto,
  TuitionFeesListResponse,
  TuitionFeesQueryParams,
  CreateTuitionFeesRequest,
  UpdateTuitionFeesRequest,
  TuitionFeesGradeFeesItem,
} from '../types/tuition-fees.types';

const serializeParams = (params?: TuitionFeesQueryParams) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

export async function getTuitionFees(
  params?: TuitionFeesQueryParams
): Promise<TuitionFeesListResponse> {
  const response: AxiosResponse<TuitionFeesListResponse> = await axiosClient.get(
    TuitionFeesEndpoints.base,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  return response.data;
}

export async function getTuitionFeesById(id: string): Promise<TuitionFeesDto> {
  const response: AxiosResponse<ApiResponseModel<TuitionFeesDto>> = await axiosClient.get(
    TuitionFeesEndpoints.getById(id)
  );

  return (response.data.data ?? response.data.value) as TuitionFeesDto;
}

export async function createTuitionFees(
  data: CreateTuitionFeesRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    TuitionFeesEndpoints.create,
    data
  );

  return response.data;
}

export async function updateTuitionFees(
  data: UpdateTuitionFeesRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    TuitionFeesEndpoints.update,
    data
  );

  return response.data;
}

export async function deleteTuitionFees(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    TuitionFeesEndpoints.delete(id)
  );

  return response.data;
}

export async function calculationTuitionFees(
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<ApiResponseModel<unknown>> {
  const response: AxiosResponse<ApiResponseModel<unknown>> = await axiosClient.get(
    TuitionFeesEndpoints.calculationTuitionFees,
    { params }
  );

  return response.data;
}

export async function getTuitionFeesByGradeAndSchoolBranch(
  gradId: string,
  schoolBrancheId: string
): Promise<TuitionFeesDto> {
  const response: AxiosResponse<ApiResponseModel<TuitionFeesDto>> = await axiosClient.get(
    TuitionFeesEndpoints.getByGradeAndSchoolBranch(gradId, schoolBrancheId)
  );

  return (response.data.data ?? response.data.value) as TuitionFeesDto;
}

export async function getGradesFeesBySchoolBranch(
  schoolBrancheId: string
): Promise<TuitionFeesGradeFeesItem[]> {
  const response: AxiosResponse<ApiResponseModel<TuitionFeesGradeFeesItem[]>> = await axiosClient.get(
    TuitionFeesEndpoints.getGradesFeesBySchoolBranch(schoolBrancheId)
  );

  return (response.data.data ?? response.data.value ?? []) as TuitionFeesGradeFeesItem[];
}

export const tuitionFeesApiService = {
  getTuitionFees,
  getTuitionFeesById,
  createTuitionFees,
  updateTuitionFees,
  deleteTuitionFees,
  calculationTuitionFees,
  getTuitionFeesByGradeAndSchoolBranch,
  getGradesFeesBySchoolBranch,
};

export default tuitionFeesApiService;
