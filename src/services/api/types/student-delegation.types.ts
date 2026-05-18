/**
 * Student Delegation Types
 * Defines API contracts for the StudentDelegation endpoints.
 */

// ============================================================================
// Main Types
// ============================================================================

export interface StudentDelegation {
  id: string;
  studentId: string;
  fullName: string;
  mobileNumber: string;
  personType: number;
  otherPersonName: string;
  identityNumber: string;
  identityImagePath: string;
  carPlateLetters: string;
  carPlateNumbers: string;
  drivingLicenseImagePath: string;
  durationType: number;
  startDate: string | null;
  endDate: string | null;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface StudentDelegationQueryParams {
  studentId?: string;
  PageIndex?: number;
  PageSize?: number;
}

// ============================================================================
// Response Types
// ============================================================================

export interface StudentDelegationListData {
  studentDelegations: StudentDelegation[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentDelegationListResponse {
  data: StudentDelegationListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface StudentDelegationDetailResponse {
  data: StudentDelegation;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateStudentDelegationRequest {
  StudentId: string;
  FullName: string;
  MobileNumber: string;
  PersonType: number;
  OtherPersonName?: string;
  IdentityNumber: string;
  IdentityImagePath?: File;
  CarPlateLetters?: string;
  CarPlateNumbers?: string;
  DrivingLicenseImagePath?: File;
  DurationType: number;
  StartDate?: string;
  EndDate?: string;
}

export interface UpdateStudentDelegationRequest extends CreateStudentDelegationRequest {
  Id: string;
}
