/**
 * Tuition Fees Types
 * Defines API contracts for tuition fees endpoints.
 */

export interface TuitionFeesInstallmentDto {
  dueDate: string; // ISO date string
  percentage?: number;
}

export interface TuitionFeesInstallmentPlanDto {
  id?: string;
  installmentsCount: number;
  distributionType: number;
  installmentDto: TuitionFeesInstallmentDto[];
}

export interface TuitionFeesServiceDto {
  nameAr: string;
  nameEn: string;
}

export interface TuitionFeesPaidServiceDto {
  id?: string;
  nameAr: string;
  nameEn: string;
  amount: number;
}

export interface TuitionFeesPaymentMethodDto {
  paymentMethodId: string;
  arabicName: string;
  englishName: string;
}

export interface TuitionFeesDto {
  id: string;
  schoolBrancheId: string;
  tuitionAmount: number;
  gradeId: string;
  gradeNameAr: string;
  gradeNameEn: string;
  installmentPlansDto: TuitionFeesInstallmentPlanDto[];
  tuitionFeesServicesDto: TuitionFeesServiceDto[];
  tuitionFeesPaidServicesDto: TuitionFeesPaidServiceDto[];
  paymentMethodIds: TuitionFeesPaymentMethodDto[];
}

export interface TuitionFeesListData {
  tuitionFees: TuitionFeesDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface TuitionFeesListResponse {
  data: TuitionFeesListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}

export interface TuitionFeesQueryParams {
  SchoolBrancheId?: string;
  Search?: string;
  PaymentMethodId?: string;
  PageIndex?: number;
  PageSize?: number;
}

export interface CreateTuitionFeesRequest {
  schoolBrancheId: string;
  tuitionAmount: number;
  installmentPlansDto: Array<{
    id?: string;
    installmentsCount: number;
    distributionType: number;
    installmentDto: Array<{
      dueDate: string;
      percentage?: number;
    }>;
  }>;
  gradeId: string;
  tuitionFeesServicesDto: Array<{
    nameAr: string;
    nameEn: string;
  }>;
  tuitionFeesPaidServicesDto: Array<{
    id?: string;
    nameAr: string;
    nameEn: string;
    amount: number;
  }>;
  paymentMethodIds: string[];
}

export interface UpdateTuitionFeesRequest extends CreateTuitionFeesRequest {
  id: string;
}

export interface TuitionFeesGradeFeesItem {
  gradeId: string;
  gradeNameAr?: string;
  gradeNameEn?: string;
  tuitionAmount?: number;
}

// GetAllInstallments
export interface InstallmentDto {
  id: string;
  dueDate: string;
  percentage: number;
}

export interface InstallmentListData {
  getAllInstallmentDtos: InstallmentDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface InstallmentListResponse {
  data: InstallmentListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}

export interface InstallmentQueryParams {
  schoolBranchId: string;
  PageNumber?: number;
  PageSize?: number;
}

// InstallmentPlanByInstallmentId
export interface InstallmentPlanByIdDto {
  id: string;
  installmentsCount: number;
  distributionType: number;
}

export interface InstallmentPlanByIdResponse {
  data: InstallmentPlanByIdDto | null;
  isSuccess: boolean;
  message: string;
  validationErrors: unknown;
}
