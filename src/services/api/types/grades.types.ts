export interface GradeDto {
  id: string;
  nameAr: string;
  nameEn: string;
  age: number;
}

export interface GradeDetailsDto {
  id: string;
  nameAr: string;
  nameEn: string;
  age: number;
}

export interface GradeListData {
  gradeDtos: GradeDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface GradeListResponse {
  value: GradeListData;
  isSuccess: boolean;
  successMessage: string;
}

export interface GradeQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SchoolBranchId?: string;
}
