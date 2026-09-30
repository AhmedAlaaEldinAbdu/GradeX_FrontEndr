import type { Pagination } from '@/types/Pagination';

export type OfferConditionDto = {
  id?: string;
  field: number;
  operator: number;
  value: string;
};

export type OfferDto = {
  id: string;
  schoolBranchId: string;
  nameAr: string;
  nameEn: string;
  offerType: number;
  amount: number | null;
  percentage: number | null;
  applyOn: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  matchAllConditions: boolean;
  conditions: OfferConditionDto[];
};

export interface OfferListData extends Pagination {
  offerDto: OfferDto[];
}

export interface OfferListResponse {
  data: OfferListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}

export interface OfferQueryParams {
  // Some endpoints in this backend use camelCase query params...
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  schoolBranchId?: string;
  isActive?: boolean;

  // ...others use PascalCase. Supporting both avoids subtle bugs.
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  SchoolBranchId?: string;
  IsActive?: boolean;
}

export type CreateOfferRequest = {
  schoolBranchId: string;
  nameAr: string;
  nameEn: string;
  offerType: number;
  amount: number | null;
  percentage: number | null;
  applyOn: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  matchAllConditions: boolean;
  conditions: Array<{
    field: number;
    operator: number;
    value: string;
  }>;
};

export type UpdateOfferRequest = CreateOfferRequest & {
  id: string;
};
