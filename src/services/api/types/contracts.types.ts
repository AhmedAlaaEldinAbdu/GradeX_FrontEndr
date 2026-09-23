import type { ApiResponseModel } from '../config';
import { SchoolKind, IdentityType, Semester, WithdrawalTime } from '@/shared/enums/enums';

// ============================================================================
// Enums — re-exported from the shared enums module so call sites can keep
// importing them from this types file. Source of truth is `shared/enums/enums`.
// ============================================================================

export { SchoolKind, IdentityType, Semester, WithdrawalTime };

// ============================================================================
// Sub-DTOs
// ============================================================================

export interface ContractWithdrawalPeriodDto {
  semester: Semester;
  withdrawalPeriodText: string | null;
  adminFeeDiscountPercentage: number;
  totalFees: number;
  withdrawalTime: WithdrawalTime;
}

// ============================================================================
// Contract DTOs (server shape)
// ============================================================================

export interface SchoolContractDto {
  id: string;
  schoolBranchId: string;
  description: SchoolKind;
  commercialRegister: string;
  nationalAddress: string;
  representativeName: string;
  representativePosition: string;
  representativeDocumentUrl?: string | null;
  identityType: IdentityType;
  mobileNumber: string;
  phoneNumber: string;
  email: string;
  nationalityId: string;
  administrativeFees: number;
  valueAddedtax: number;
  withdrawalPeriods: ContractWithdrawalPeriodDto[];
}

/**
 * Row shape for the contracts list page (per the upcoming
 * GetAllContractBySchoolBranchId response).
 */
export interface ContractListItem {
  id: string;
  code: string;
  studentId?: string | null;
  studentName?: string | null;
  studentAvatar?: string | null;
  date?: string | null;
  contractFileUrl?: string | null;
}

// ============================================================================
// Request payloads
// ============================================================================

/**
 * Payload shape consumed by `createSchoolContract`. The service helper turns
 * this into a `FormData` body (the API expects multipart/form-data because of
 * the `RepresentativeDocument` file field).
 */
export interface CreateSchoolContractRequest {
  schoolBranchId: string;
  description: SchoolKind;
  commercialRegister: string;
  nationalAddress: string;
  representativeName: string;
  representativePosition: string;
  representativeDocument?: File | null;
  identityType: IdentityType;
  mobileNumber: string;
  phoneNumber: string;
  email: string;
  nationalityId: string;
  administrativeFees: number;
  valueAddedtax: number;
  withdrawalPeriods: ContractWithdrawalPeriodDto[];
}

export interface UpdateSchoolContractRequest extends CreateSchoolContractRequest {
  id: string;
}

export interface RequestSignContractPayload {
  studentId: string;
}

export interface ConfirmSignContractPayload {
  studentId: string;
  otp: string;
}

// ============================================================================
// Query params
// ============================================================================

export interface ContractsQueryParams {
  SchoolBranchId: string;
  PageNumber?: number;
  PageSize?: number;
}

// ============================================================================
// Response shapes
// ============================================================================

export interface ContractsListData {
  contracts?: ContractListItem[];
  schoolContractDto?: ContractListItem[];
  pageIndex?: number;
  pageNumber?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
}

export type ContractsListResponse = ApiResponseModel<ContractsListData>;
export type SchoolContractResponse = ApiResponseModel<SchoolContractDto>;
/** Placeholder until you share the request/confirm-sign response payload. */
export type SignContractResponse = ApiResponseModel<unknown>;
