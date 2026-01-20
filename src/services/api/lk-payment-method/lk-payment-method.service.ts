import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { LKPaymentMethodEndpoints } from '../endpoints/lk-payment-method-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  LKPaymentMethodDto,
  LKPaymentMethodListResponse,
  LKPaymentMethodQueryParams,
  CreateLKPaymentMethodRequest,
  UpdateLKPaymentMethodRequest,
} from '../types/lk-payment-method.types';

const serializeParams = (params?: LKPaymentMethodQueryParams) => {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams.toString();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

export async function getLKPaymentMethods(
  params?: LKPaymentMethodQueryParams
): Promise<LKPaymentMethodListResponse> {
  const response: AxiosResponse<LKPaymentMethodListResponse> = await axiosClient.get(
    LKPaymentMethodEndpoints.base,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  return response.data;
}

export async function getLKPaymentMethodById(id: string): Promise<LKPaymentMethodDto> {
  const response: AxiosResponse<ApiResponseModel<LKPaymentMethodDto>> = await axiosClient.get(
    LKPaymentMethodEndpoints.getById(id)
  );

  return (response.data.data ?? response.data.value) as LKPaymentMethodDto;
}

export async function createLKPaymentMethod(
  data: CreateLKPaymentMethodRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    LKPaymentMethodEndpoints.create,
    data
  );

  return response.data;
}

export async function updateLKPaymentMethod(
  data: UpdateLKPaymentMethodRequest
): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    LKPaymentMethodEndpoints.update,
    data
  );

  return response.data;
}

export async function deleteLKPaymentMethod(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    LKPaymentMethodEndpoints.delete(id)
  );

  return response.data;
}

export const lkPaymentMethodApiService = {
  getLKPaymentMethods,
  getLKPaymentMethodById,
  createLKPaymentMethod,
  updateLKPaymentMethod,
  deleteLKPaymentMethod,
};

export default lkPaymentMethodApiService;
