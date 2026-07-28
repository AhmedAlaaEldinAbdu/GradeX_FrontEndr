/**
 * School API Types
 * Type definitions for school-related API requests and responses
 */

import type { SchoolFormData } from '@/pages/super-admin-dashboard/schools/types/school.types';

// ============================================================================
// Base School Types
// ============================================================================

export interface School {
  id: string;
  name?: string;
  nameAr: string;
  nameEn: string;
  academicSystemId: string;
  foundingDate: string;
  description: string;
  services: string | null;
  numberOfStudents: number | null;
  numberOfTeachers: number | null;
  isCurrentSystem: boolean;
  financialData: {
    id: string;
    bankName: string;
    iban: string;
    accountNumber: string;
    schoolId: string;
  };
  email: string;
  webSite: string;
  phoneNumber: string;
  landlineNumber: string;
  communicationOfficer: string;
  schoolStatus: SchoolStatusEnum;
  schoolGender: number;
  otherBranches: boolean;
  schoolStagesDto: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    lkSchoolStageId: string;
    schoolId: string;
  }>;
  applicationFeaturesDto: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    lkApplicationFeatureId: string;
    schoolId: string;
  }>;
  licensesAttachments: Array<{
    id: string;
    fileName: string;
    filePath: string;
    schoolId: string;
  }>;
  schoolBranches: Array<{
    id: string;
    lkCountryId: string;
    city: string;
    neighborhood: string;
    region: string;
    street: string;
    buildingNumber: string;
    zipCode: string;
    buildingCount: number;
    classCount: number;
    schoolSpace: number;
    latitude: number;
    longitude: number;
    address: string;
    schoolId: string;
  }>;
  facilities: Array<{
    id: string;
    arabicName: string;
    englishName: string;
    description: string;
    imageUrl: string;
    schoolId: string;
    licensesAttachmentsFacilities: Array<{
      id: string;
      attachmentFile: string;
      attachmentName: string;
      lkFacilitiesId: string;
    }>;
  }>;
}

export const SchoolStatusEnum = {
  ACTIVE: 1,
  REJECTED: 2,
  PENDING: 3,
  DELETED: 4,
} as const;

export type SchoolStatusEnum = (typeof SchoolStatusEnum)[keyof typeof SchoolStatusEnum];

// Legacy status type for compatibility
export const SchoolStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
} as const;

export type SchoolStatus = (typeof SchoolStatus)[keyof typeof SchoolStatus];

// ============================================================================
// Detailed School Types
// ============================================================================

export interface SchoolDetail extends School {
  logo?: string;
  documents?: Document[];
  statistics?: SchoolStats;
}

export interface SchoolFeatures {
  attendance: boolean;
  bookTracking: boolean;
  expensesTracking: boolean;
  fullPayment: boolean;
}

export interface BankingInfo {
  bankName: string;
  accountNumber: string;
  iban: string;
}

export interface ContactInfo {
  landline: string;
  phone: string;
  email: string;
  website: string;
  contactPerson: string;
}

export interface AddressInfo {
  region: string;
  state: string;
  city: string;
  street: string;
  district: string;
  buildingNumber: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Facilities {
  playground: boolean;
  library: boolean;
  laboratory: boolean;
  sportField: boolean;
  canteen: boolean;
  busService: boolean;
  hasBranches: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: AddressInfo;
  contact: ContactInfo;
  status: SchoolStatus;
}

export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalStaff: number;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateSchoolRequest {
  name: string;
  academicSystem: string;
  foundationDate: string;
  description: string;
  country: string;
  currentSystem?: string | null;
  features: SchoolFeatures;
  banking: BankingInfo;
  contact: ContactInfo;
  address: AddressInfo;
  facilities: Facilities;
  logo?: string;
}

export interface UpdateSchoolRequest extends Partial<CreateSchoolRequest> {
  id?: string;
}

export interface ApproveSchoolRequest {
  notes?: string;
}

export interface RejectSchoolRequest {
  reason: string;
}

export interface BulkOperationRequest {
  ids: string[];
  reason?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface SchoolListResponse {
  items: School[];
  totalItems: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface SchoolDetailResponse {
  data: SchoolDetail;
}

export interface SchoolBranchMobileInfo {
  schoolBranchId: string;
  schoolId: string;
  nameBranch: string;
  city?: string;
  codeSchoolCity?: string;
  neighborhood?: string;
  region?: string;
  street?: string;
  email?: string;
  webSite?: string;
  phoneNumber?: string;
  landlineNumber?: string;
}

export interface BulkOperationResponse {
  success: boolean;
  successCount: number;
  failedCount: number;
  failed?: Array<{
    id: string;
    reason: string;
  }>;
}

export interface SchoolStatisticsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  inactive: number;
  deleted: number;
  byCountry: Array<{
    country: string;
    count: number;
  }>;
  byAcademicSystem: Array<{
    system: string;
    count: number;
  }>;
  recentRegistrations: number;
  monthlyGrowth: number;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface SchoolFilters {
  searchTerm?: string;
  schoolStatus?: SchoolStatusEnum | SchoolStatusEnum[];
  academicSystemId?: string;
  lKCountryId?: string;
  region?: string;
  neighborhood?: string;
}

// ============================================================================
// Query Params
// ============================================================================

export interface SchoolQueryParams extends SchoolFilters {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: SchoolSortField;
  sortOrder?: 'asc' | 'desc';
}

export const SchoolSortField = {
  NAME: 'name',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  STATUS: 'status',
  COUNTRY: 'country',
  ACADEMIC_SYSTEM: 'academicSystem',
} as const;

export type SchoolSortField = (typeof SchoolSortField)[keyof typeof SchoolSortField];

// ============================================================================
// Form Data Export (re-export from existing types)
// ============================================================================

export type { SchoolFormData };

// ============================================================================
// Validation Types
// ============================================================================

export interface SchoolValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SchoolValidationResponse {
  valid: boolean;
  errors?: SchoolValidationError[];
}
