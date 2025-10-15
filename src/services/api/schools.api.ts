/**
 * Schools API Service
 * Handles all API calls related to schools management
 */

import { httpClient } from '@/lib/fetch';
import { API_ENDPOINTS } from './config';
import type {
  SchoolFormData,
  SchoolListResponse,
  SchoolDetailResponse,
  SchoolStatisticsResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  BulkOperationResponse,
} from './types/school.types';
import type { ApiSuccessResponse } from './config';

// ============================================================================
// School CRUD Operations
// ============================================================================

/**
 * Get list of schools with pagination and filters
 */
export async function getSchools(): Promise<SchoolListResponse> {
  /* params?: PaginationParams & SchoolFilters */
  const response = await httpClient.get<ApiSuccessResponse<SchoolListResponse>>(
    API_ENDPOINTS.SCHOOLS.LIST,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // Extract data from ApiSuccessResponse wrapper
  return response.data.data;
}

/**
 * Get school by ID
 */
export async function getSchoolById(id: string): Promise<SchoolDetailResponse> {
  const response = await httpClient.get<ApiSuccessResponse<SchoolDetailResponse>>(
    API_ENDPOINTS.SCHOOLS.GET_BY_ID(id)
  );

  return response.data.data;
}

/**
 * Create a new school
 */
export async function createSchool(data: CreateSchoolRequest): Promise<SchoolDetailResponse> {
  const response = await httpClient.post<ApiSuccessResponse<SchoolDetailResponse>>(
    API_ENDPOINTS.SCHOOLS.CREATE,
    data
  );

  return response.data.data;
}

/**
 * Update an existing school
 */
export async function updateSchool(
  id: string,
  data: UpdateSchoolRequest
): Promise<SchoolDetailResponse> {
  const response = await httpClient.put<ApiSuccessResponse<SchoolDetailResponse>>(
    API_ENDPOINTS.SCHOOLS.UPDATE(id),
    data
  );

  return response.data.data;
}

/**
 * Delete a school (soft delete)
 */
export async function deleteSchool(id: string): Promise<{ success: boolean }> {
  const response = await httpClient.delete<ApiSuccessResponse<{ success: boolean }>>(
    API_ENDPOINTS.SCHOOLS.DELETE(id)
  );

  return response.data.data;
}

/**
 * Restore a deleted school
 */
export async function restoreSchool(id: string): Promise<{ success: boolean }> {
  const response = await httpClient.post<ApiSuccessResponse<{ success: boolean }>>(
    API_ENDPOINTS.SCHOOLS.RESTORE(id)
  );

  return response.data.data;
}

// ============================================================================
// School Status Management
// ============================================================================

/**
 * Get pending schools
 */
export async function getPendingSchools(): Promise<SchoolListResponse> {
  /* params?: PaginationParams */
  const response = await httpClient.get<ApiSuccessResponse<SchoolListResponse>>(
    API_ENDPOINTS.SCHOOLS.PENDING,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.data;
}

/**
 * Get rejected schools
 */
export async function getRejectedSchools(): Promise<SchoolListResponse> {
  /* params?: PaginationParams */
  const response = await httpClient.get<ApiSuccessResponse<SchoolListResponse>>(
    API_ENDPOINTS.SCHOOLS.REJECTED,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.data;
}

/**
 * Get deleted schools
 */
export async function getDeletedSchools(): Promise<SchoolListResponse> {
  /* params?: PaginationParams */
  const response = await httpClient.get<ApiSuccessResponse<SchoolListResponse>>(
    API_ENDPOINTS.SCHOOLS.DELETED,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.data;
}

/**
 * Approve a school
 */
export async function approveSchool(id: string, notes?: string): Promise<SchoolDetailResponse> {
  const response = await httpClient.post<ApiSuccessResponse<SchoolDetailResponse>>(
    API_ENDPOINTS.SCHOOLS.APPROVE(id),
    { notes }
  );

  return response.data.data;
}

/**
 * Reject a school
 */
export async function rejectSchool(id: string, reason: string): Promise<SchoolDetailResponse> {
  const response = await httpClient.post<ApiSuccessResponse<SchoolDetailResponse>>(
    API_ENDPOINTS.SCHOOLS.REJECT(id),
    { reason }
  );

  return response.data.data;
}

/**
 * Activate a school
 */
export async function activateSchool(id: string): Promise<SchoolDetailResponse> {
  const response = await httpClient.post<ApiSuccessResponse<SchoolDetailResponse>>(
    API_ENDPOINTS.SCHOOLS.ACTIVATE(id)
  );

  return response.data.data;
}

/**
 * Deactivate a school
 */
export async function deactivateSchool(id: string): Promise<SchoolDetailResponse> {
  const response = await httpClient.post<ApiSuccessResponse<SchoolDetailResponse>>(
    API_ENDPOINTS.SCHOOLS.DEACTIVATE(id)
  );

  return response.data.data;
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk delete schools
 */
export async function bulkDeleteSchools(ids: string[]): Promise<BulkOperationResponse> {
  const response = await httpClient.post<ApiSuccessResponse<BulkOperationResponse>>(
    API_ENDPOINTS.SCHOOLS.BULK_DELETE,
    { ids }
  );

  return response.data.data;
}

/**
 * Bulk approve schools
 */
export async function bulkApproveSchools(ids: string[]): Promise<BulkOperationResponse> {
  const response = await httpClient.post<ApiSuccessResponse<BulkOperationResponse>>(
    API_ENDPOINTS.SCHOOLS.BULK_APPROVE,
    { ids }
  );

  return response.data.data;
}

/**
 * Bulk reject schools
 */
export async function bulkRejectSchools(
  ids: string[],
  reason: string
): Promise<BulkOperationResponse> {
  const response = await httpClient.post<ApiSuccessResponse<BulkOperationResponse>>(
    API_ENDPOINTS.SCHOOLS.BULK_REJECT,
    { ids, reason }
  );

  return response.data.data;
}

// ============================================================================
// Statistics & Reports
// ============================================================================

/**
 * Get school statistics
 */
export async function getSchoolStatistics(): Promise<SchoolStatisticsResponse> {
  const response = await httpClient.get<ApiSuccessResponse<SchoolStatisticsResponse>>(
    API_ENDPOINTS.SCHOOLS.STATISTICS
  );

  return response.data.data;
}

/**
 * Export schools data
 */
export async function exportSchools(): Promise<Blob> {
  /* format: 'csv' | 'excel' | 'pdf' = 'excel', filters?: SchoolFilters */
  const response = await httpClient.get<Blob>(API_ENDPOINTS.SCHOOLS.EXPORT, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

// ============================================================================
// File Upload
// ============================================================================

/**
 * Upload school logo
 */
export async function uploadSchoolLogo(file: File): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'logo');

  const response = await httpClient.upload<ApiSuccessResponse<{ url: string; path: string }>>(
    '/upload/image',
    formData
  );

  return response.data.data;
}

/**
 * Upload school documents
 */
export async function uploadSchoolDocument(file: File): Promise<{ url: string; path: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'document');

  const response = await httpClient.upload<ApiSuccessResponse<{ url: string; path: string }>>(
    '/upload/document',
    formData
  );

  return response.data.data;
}

/**
 * Bulk import schools from CSV/Excel
 */
export async function bulkImportSchools(file: File): Promise<BulkOperationResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await httpClient.upload<ApiSuccessResponse<BulkOperationResponse>>(
    '/upload/bulk',
    formData
  );

  return response.data.data;
}

/**
 * Transform form data to API request format
 */
export function transformSchoolFormToRequest(
  formData: SchoolFormData
): CreateSchoolRequest | UpdateSchoolRequest {
  return {
    // Basic Info
    name: formData.schoolName,
    academicSystem: formData.academicSystem,
    foundationDate: formData.foundationDate,
    description: formData.aboutSchool,
    currentSystem: formData.hasCurrentSystem ? formData.currentSystem : null,
    country: formData.country,

    // Application Features
    features: {
      attendance: formData.applicationFeatures.attendanceAndDeparture,
      bookTracking: formData.applicationFeatures.remoteBookTracking,
      expensesTracking: formData.applicationFeatures.expensesTrackingOnly,
      fullPayment: formData.applicationFeatures.fullExpensesPayment,
    },

    // Financial Data
    banking: {
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      iban: formData.ibanNumber,
    },

    // Contact Info
    contact: {
      landline: formData.landline,
      phone: formData.phoneNumber,
      email: formData.email,
      website: formData.website,
      contactPerson: formData.contactPerson,
    },

    // Address
    address: {
      region: formData.region,
      state: formData.state,
      city: formData.city,
      street: formData.street,
      district: formData.district,
      buildingNumber: formData.buildingNumber,
      postalCode: formData.postalCode,
    },

    // Facilities
    facilities: {
      playground: formData.facilities.playground,
      library: formData.facilities.library,
      laboratory: formData.facilities.laboratory,
      sportField: formData.facilities.sportField,
      canteen: formData.facilities.canteen,
      busService: formData.facilities.busService,
      hasBranches: formData.hasBranches,
    },
  };
}

/**
 * Transform API response to form data
 */
export function transformSchoolResponseToForm(response: SchoolDetailResponse): SchoolFormData {
  const school = response.data || response;

  return {
    schoolName: school.name || '',
    academicSystem: school.academicSystem || '',
    foundationDate: school.foundationDate || '',
    aboutSchool: school.description || '',
    hasCurrentSystem: !!school.currentSystem,
    currentSystem: school.currentSystem || '',
    country: school.country || '',

    applicationFeatures: {
      attendanceAndDeparture: school.features?.attendance || false,
      remoteBookTracking: school.features?.bookTracking || false,
      expensesTrackingOnly: school.features?.expensesTracking || false,
      fullExpensesPayment: school.features?.fullPayment || false,
    },

    bankName: school.banking?.bankName || '',
    accountNumber: school.banking?.accountNumber || '',
    ibanNumber: school.banking?.iban || '',

    landline: school.contact?.landline || '',
    phoneNumber: school.contact?.phone || '',
    email: school.contact?.email || '',
    website: school.contact?.website || '',
    contactPerson: school.contact?.contactPerson || '',

    region: school.address?.region || '',
    state: school.address?.state || '',
    city: school.address?.city || '',
    street: school.address?.street || '',
    district: school.address?.district || '',
    buildingNumber: school.address?.buildingNumber || '',
    postalCode: school.address?.postalCode || '',
    hasBranches: school.facilities?.hasBranches || false,

    hasOtherBranches: school.facilities?.hasBranches || false,
    attendanceFeature: school.features?.attendance || false,
    buyBooksFeature: school.features?.bookTracking || false,
    payCashFeature: school.features?.expensesTracking || false,
    payInstallmentFeature: school.features?.fullPayment || false,

    facilities: {
      playground: school.facilities?.playground || false,
      library: school.facilities?.library || false,
      laboratory: school.facilities?.laboratory || false,
      sportField: school.facilities?.sportField || false,
      canteen: school.facilities?.canteen || false,
      busService: school.facilities?.busService || false,
    },
  };
}

// ============================================================================
// Export All
// ============================================================================

export const schoolsApi = {
  // CRUD
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  restoreSchool,

  // Status
  getPendingSchools,
  getRejectedSchools,
  getDeletedSchools,
  approveSchool,
  rejectSchool,
  activateSchool,
  deactivateSchool,

  // Bulk
  bulkDeleteSchools,
  bulkApproveSchools,
  bulkRejectSchools,

  // Statistics
  getSchoolStatistics,
  exportSchools,

  // Upload
  uploadSchoolLogo,
  uploadSchoolDocument,
  bulkImportSchools,

  // Transformers
  transformSchoolFormToRequest,
  transformSchoolResponseToForm,
};
