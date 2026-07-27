/**
 * Parent Types
 * Defines API contracts for the Parent controller.
 *
 * Note: several backend fields keep the API's original spelling
 * (e.g. `confiremPassword`, ConfiremOtp) — do not "fix" them.
 */

// ============================================================================
// Generic response envelope
// ============================================================================

export interface ParentApiResponse<T = unknown> {
  data: T;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

// ============================================================================
// Auth / account requests
// ============================================================================

export interface RegisterParentRequest {
  fullName: string;
  lkCountryId: string;
  nationalityId: string;
  identityType: number; // 1 - 2
  appLanguage: number; // 1 - 2
  userType: number; // 1 - 5
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
  confiremPassword: string; // backend spelling
  regionId: string;
  cityId: string;
  districtName: string;
  streetName: string;
  buildingNumber: string;
  latitude: number;
  longitude: number;
  locationUrl: string;
}

export interface ParentLoginRequest {
  countryCode: string;
  phoneNumber: string;
  password: string;
  userType: number; // 1 - 5
}

export interface ParentResendOtpRequest {
  countryCode: string;
  phoneNumber: string;
}

export interface ParentConfirmOtpRequest {
  countryCode: string;
  phoneNumber: string;
  otp: string;
}

export interface ParentChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confiremPassword: string; // backend spelling
}

export interface ParentResetPasswordRequest {
  countryCode: string;
  phoneNumber: string;
  password: string;
  confiremPassword: string; // backend spelling
  otp: string;
}

// ============================================================================
// Profile update (PUT /api/Parent — multipart/form-data)
// ============================================================================

export interface UpdateParentRequest {
  Id: string;
  FullName: string;
  LKCountryId: string;
  NationalityId: string;
  IdentityType: number; // 1 - 2
  PostalCode?: string;
  appLanguage: number; // 1 - 2
  UserType: number; // 1 - 5
  RegionId: string;
  CityId: string;
  DistrictName?: string;
  StreetName?: string;
  BuildingNumber?: string;
  Latitude?: string;
  Longitude?: string;
  LocationUrl?: string;
  RelationshipType?: number; // 1 - 10
  PictureProfile?: File;
  EducationalCustody?: File;
  ElectronicSignature?: File;
}

// ============================================================================
// Favorites
// ============================================================================

export interface LikeFavoriteSchoolBranchRequest {
  schoolBranchId: string;
}

export interface DisLikeFavoriteSchoolBranchRequest {
  Id: string;
}

// ============================================================================
// Profile
// ============================================================================

export interface ParentProfile {
  id: string;
  userId?: string;
  fullName: string;
  // Backend profile shape is not fully specified; keep it extensible.
  [key: string]: unknown;
}

// ============================================================================
// Parents by branch (GET /api/Parent/by-branchId/{schoolBranchId})
// ============================================================================

export interface ParentListItem {
  id: string;
  userId: string;
  fullName: string;
}

export interface ParentsByBranchData {
  parents: ParentListItem[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface ParentsByBranchResponse {
  data: ParentsByBranchData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface ParentsByBranchQueryParams {
  pageIndex?: number;
  pageSize?: number;
}

export interface DeleteParentAccountRequest {
  phoneNumber: string;
  countryCode: string;
  password: string;
}
