import type { Pagination } from '@/types/Pagination';

export interface InvoiceItemDto {
  id?: string;
  name: string;
  amount: number;
  discount?: number;
}

export interface SchoolInfo {
  phoneNumber?: string | null;
  email?: string | null;
  webSite?: string | null;
  landlineNumber?: string | null;
  communicationOfficer?: string | null;
}

export interface InvoiceItemFetchDto {
  id: string;
  nameAr: string;
  nameEn: string | null;
  amount: number;
}

export interface InvoiceItemsData {
  applicationId: string | null;
  tuitionFeesId: string;
  tuitionFeesNameAr: string;
  tuitionFeesNameEn: string | null;
  tuitionFeesAmount: number;
  items: InvoiceItemFetchDto[];
  lKPaymentMethodId: string;
  installmentPlanId: string | null;
  offerAmount: number;
  offerPercentage: number;
  totalDiscount: number;
  subTotal: number;
  netTotal: number;
  dueDate: string | null;
}

export interface InvoiceItemsResponse {
  data: InvoiceItemsData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}

export interface InvoiceDto {
  id: string;
  customerId: string;
  schoolBranchId: string;
  schoolBranchName?: string | null;
  schoolBranchNameAr?: string | null;
  schoolBranchNameEn?: string | null;
  schoolInfo?: SchoolInfo | null;
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
  items?: InvoiceItemDto[] | null;
  paymentMethodId: string;
  paymentMethodName?: string | null;
  paymentMethodNameAr?: string | null;
  paymentMethodNameEn?: string | null;
  gradeId?: string | null;
  gradeName?: string | null;
  gradeNameAr?: string | null;
  gradeNameEn?: string | null;
  classroomId?: string | null;
  classroomName?: string | null;
  classroomNameAr?: string | null;
  classroomNameEn?: string | null;
  customerName?: string | null;
  phoneNumber?: string | null;
  status?: number | null;
  receiptUrl?: string | null;
  itemsName?: string[] | null;
  paidAmount?: number | null;
  dueAmount?: number | null;
  dueDate?: string | null;
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
  customerId: string;
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
