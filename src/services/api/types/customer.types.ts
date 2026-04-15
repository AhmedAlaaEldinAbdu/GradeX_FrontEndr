import type { Pagination } from '@/types/Pagination';

export interface CustomerDto {
  id: string;
  name: string;
  customerType: number;
  nationalId: string;
  email: string;
  areaCode: string;
  phoneNumber: string;
  additionalAreaCode?: string | null;
  additionalPhoneNumber?: string | null;
  regionId: string;
  region: string;
  lkCountryId: string;
  lKCountries: string;
  buldingNo: string;
  streetNo: string;
  neighborhood: string;
  gradeId?: string | null;
  gradeName?: string | null;
  classroomId?: string | null;
  classroomName?: string | null;
}

export interface CustomerListData extends Pagination {
  customerDto: CustomerDto[];
}

export interface CustomerListResponse {
  data: CustomerListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}

export interface CustomerQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;

  PageIndex?: number;
  PageSize?: number;
  Search?: string;
}

export interface CreateCustomerRequest {
  name: string;
  customerType: number;
  nationalId: string;
  email: string;
  areaCode: string;
  phoneNumber: string;
  additionalAreaCode?: string | null;
  additionalPhoneNumber?: string | null;
  regionId: string;
  lkCountryId: string;
  buldingNo: string;
  streetNo: string;
  neighborhood: string;
  gradeId?: string | null;
  classroomId?: string | null;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest {
  id: string;
}
