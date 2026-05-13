import type { ApiResponseModel } from '../config';

// ============================================================================
// Enums — exact integer values still need backend confirmation. The mappings
// below match the form's left-to-right radio order; flip them once the API
// owner confirms.
// ============================================================================

/**
 * `Description` field on CreateSchoolContract — the school's legal kind.
 * TODO(api-mapping): confirm which integer is company vs foundation.
 */
export enum SchoolKind {
  Company = 1,
  Foundation = 2,
}

/**
 * `IdentityType` field on CreateSchoolContract — the representative's id kind.
 * TODO(api-mapping): confirm which integer is national vs resident.
 */
export enum IdentityType {
  National = 1,
  Resident = 2,
}

/**
 * `semester` field on CreateSchoolContractWithdrawalPeriodsDto — which term
 * the withdrawal rule applies to. Enum schema: `[1, 2]`.
 * TODO(api-mapping): confirm which integer is first vs second semester.
 */
export enum Semester {
  First = 1,
  Second = 2,
}

/**
 * `withdrawalTime` field on CreateSchoolContractWithdrawalPeriodsDto — whether
 * the rule applies before or after the term starts. Enum schema: `[0, 1]`.
 * TODO(api-mapping): confirm which integer is before vs after.
 */
export enum WithdrawalTime {
  BeforeTerm = 0,
  AfterTerm = 1,
}

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
