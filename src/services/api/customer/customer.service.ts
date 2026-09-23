import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { CustomerEndpoints } from '../endpoints/customer-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  CreateCustomerRequest,
  CustomerDto,
  CustomerListResponse,
  CustomerQueryParams,
  UpdateCustomerRequest,
} from '../types/customer.types';

const serializeParams = (params?: CustomerQueryParams) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

export async function getCustomers(params?: CustomerQueryParams): Promise<CustomerListResponse> {
  const response: AxiosResponse<CustomerListResponse> = await axiosClient.get(
    CustomerEndpoints.base,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  return response.data;
}

export async function getCustomerById(id: string): Promise<CustomerDto> {
  const response: AxiosResponse<ApiResponseModel<CustomerDto>> = await axiosClient.get(
    CustomerEndpoints.getById(id)
  );

  return (response.data.data ?? response.data.value) as CustomerDto;
}

export async function createCustomer(data: CreateCustomerRequest): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    CustomerEndpoints.create,
    data
  );

  return response.data;
}

export async function updateCustomer(data: UpdateCustomerRequest): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    CustomerEndpoints.update(data.id),
    data
  );

  return response.data;
}

export async function deleteCustomer(id: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    CustomerEndpoints.delete(id)
  );

  return response.data;
}

export const customerApiService = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

export default customerApiService;
