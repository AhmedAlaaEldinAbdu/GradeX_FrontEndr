import type { Pagination } from '@/types/Pagination';

export interface InvoiceItemDto {
  id?: string;
  name: string;
  amount: number;
  discount: number;
}

export interface InvoiceDto {
  id: string;
  studentId: string;
  schoolBranchId: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  totalDiscount: number;
  netAmount: number;
  taxPercentage: number;
  paymentType: number;
  installmentPlanId?: string | null;
  installmentId?: string | null;
  invoiceItemDtos?: InvoiceItemDto[] | null;
  paymentMethodId: string;
  paymentMethodName?: string | null;
  paymentMethodNameAr?: string | null;
  paymentMethodNameEn?: string | null;
  gradeId?: string | null;
  gradeNameAr?: string | null;
  gradeNameEn?: string | null;
  studentName?: string | null;
  status?: number | null;
  receiptUrl?: string | null;
  itemsName?: string[] | null;
}

export interface InvoiceListData extends Pagination {
  invoicesDtos: InvoiceDto[];
}

export interface InvoiceListResponse {
  data: InvoiceListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}

export interface InvoiceQueryParams {
  schoolBranchId?: string;
  pageSize?: number;
  pageIndex?: number;
  search?: string;
  paymentMethodId?: string;
  gradeId?: string;
  offerId?: string;

  SchoolBranchId?: string;
  PageSize?: number;
  PageIndex?: number;
  Search?: string;
  PaymentMethodId?: string;
  GradeId?: string;
  OfferId?: string;
}

export interface CreateInvoiceRequest {
  studentId: string;
  schoolBranchId: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  totalDiscount: number;
  netAmount: number;
  taxPercentage: number;
  paymentType: number;
  installmentPlanId?: string | null;
  installmentId?: string | null;
  invoiceItemDtos: Array<{
    name: string;
    amount: number;
    discount: number;
  }>;
  paymentMethodId: string;
}
