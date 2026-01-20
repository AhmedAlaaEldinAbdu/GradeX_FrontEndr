/**
 * LK Payment Method Types
 * Defines API contracts for LKPaymentMethod endpoints.
 */

export interface LKPaymentMethodDto {
  id: string;
  arabicName: string;
  englishName: string;
}

export interface LKPaymentMethodListData {
  lkPaymentMethodDto: LKPaymentMethodDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface LKPaymentMethodListResponse {
  data: LKPaymentMethodListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}

export interface LKPaymentMethodQueryParams {
  PageIndex?: number;
  PageSize?: number;
}

export interface CreateLKPaymentMethodRequest {
  arabicName: string;
  englishName: string;
}

export interface UpdateLKPaymentMethodRequest extends CreateLKPaymentMethodRequest {
  id: string;
}
