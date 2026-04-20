import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { InvoiceEndpoints } from '../endpoints/invoice-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  CreateInvoiceRequest,
  InvoiceDto,
  InvoiceItemsResponse,
  InvoiceListResponse,
  InvoiceQueryParams,
} from '../types/invoice.types';

const serializeParams = (params?: InvoiceQueryParams) => {
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

export async function getInvoices(params?: InvoiceQueryParams): Promise<InvoiceListResponse> {
  const response: AxiosResponse<InvoiceListResponse> = await axiosClient.get(
    InvoiceEndpoints.base,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  return response.data;
}

export async function getInvoiceById(id: string): Promise<InvoiceDto> {
  const response: AxiosResponse<ApiResponseModel<InvoiceDto>> = await axiosClient.get(
    InvoiceEndpoints.getById(id)
  );

  return (response.data.data ?? response.data.value) as InvoiceDto;
}

export async function getInvoiceNumbers(): Promise<string[]> {
  const response: AxiosResponse<ApiResponseModel<string[]>> = await axiosClient.get(
    InvoiceEndpoints.getInvoiceNumbers
  );

  return (response.data.data ?? response.data.value ?? []) as string[];
}

export async function createInvoice(
  data: CreateInvoiceRequest
): Promise<ApiResponseModel<InvoiceDto>> {
  const response: AxiosResponse<ApiResponseModel<InvoiceDto>> = await axiosClient.post(
    InvoiceEndpoints.create,
    data
  );

  return response.data;
}

export async function getInvoiceItems(studentId: string): Promise<InvoiceItemsResponse> {
  const response: AxiosResponse<InvoiceItemsResponse> = await axiosClient.get(
    InvoiceEndpoints.getItems(studentId)
  );

  return response.data;
}

export async function deleteInvoice(invoiceId: string): Promise<ApiResponseModel<string>> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    InvoiceEndpoints.delete(invoiceId)
  );

  return response.data;
}

export const invoiceApiService = {
  getInvoices,
  getInvoiceById,
  getInvoiceNumbers,
  getInvoiceItems,
  createInvoice,
  deleteInvoice,
};

export default invoiceApiService;
