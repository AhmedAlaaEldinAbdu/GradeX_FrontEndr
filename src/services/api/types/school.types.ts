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
  name: string;
  academicSystem: string;
  foundationDate: string;
  description: string;
  country: string;
  currentSystem?: string | null;
  status: SchoolStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

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
  features: SchoolFeatures;
  banking: BankingInfo;
  contact: ContactInfo;
  address: AddressInfo;
  facilities: Facilities;
  logo?: string;
  documents?: Document[];
  branches?: Branch[];
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
  data: School[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SchoolDetailResponse {
  data: SchoolDetail;
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
  search?: string;
  status?: SchoolStatus | SchoolStatus[];
  country?: string;
  academicSystem?: string;
  fromDate?: string;
  toDate?: string;
  hasCurrentSystem?: boolean;
  features?: Partial<SchoolFeatures>;
}

// ============================================================================
// Query Params
// ============================================================================

export interface SchoolQueryParams extends SchoolFilters {
  page?: number;
  limit?: number;
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
