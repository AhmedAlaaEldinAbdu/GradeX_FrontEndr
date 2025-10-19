/**
 * Schools Redux Actions (Async Thunks)
 * Async actions for schools state management
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { schoolsApiService } from '@/services/api/schools/schools.service';
import { getErrorMessage } from '@/lib/http';
import type {
  SchoolDetail,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  SchoolQueryParams,
  SchoolStatisticsResponse,
} from '@/services/api/types/school.types';
import type {
  FetchSchoolsResponse,
  FetchSchoolsPayload,
  UpdateSchoolStatusPayload,
  BulkOperationPayload,
  BulkOperationResult,
} from './schoolsTypes';

// ============================================================================
// Fetch Schools
// ============================================================================

/**
 * Fetch schools with pagination and filters
 */
export const fetchSchools = createAsyncThunk<FetchSchoolsResponse, FetchSchoolsPayload | void>(
  'schools/fetchSchools',
  async (payload, { rejectWithValue }) => {
    try {
      const params: Partial<SchoolQueryParams> = payload
        ? {
            page: payload.page,
            limit: payload.limit,
            ...payload.filters,
            sortBy: payload.sortBy as SchoolQueryParams['sortBy'],
            sortOrder: payload.sortOrder,
          }
        : {};

      const response = await schoolsApiService.getSchools(params as SchoolQueryParams);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch a single school by ID
 */
export const fetchSchoolById = createAsyncThunk<SchoolDetail, string>(
  'schools/fetchSchoolById',
  async (id, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.getSchoolById(id);
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Create/Update/Delete Schools
// ============================================================================

/**
 * Create a new school
 */
export const createSchool = createAsyncThunk<SchoolDetail, CreateSchoolRequest>(
  'schools/createSchool',
  async (data, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.createSchool(data);
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Update an existing school
 */
export const updateSchool = createAsyncThunk<
  SchoolDetail,
  { id: string; data: UpdateSchoolRequest }
>('schools/updateSchool', async ({ id, data }, { rejectWithValue }) => {
  try {
    const school = await schoolsApiService.updateSchool(id, data);
    return school;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/**
 * Delete a school (soft delete)
 */
export const deleteSchool = createAsyncThunk<string, string>(
  'schools/deleteSchool',
  async (id, { rejectWithValue }) => {
    try {
      await schoolsApiService.deleteSchool(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Restore a deleted school
 */
export const restoreSchool = createAsyncThunk<string, string>(
  'schools/restoreSchool',
  async (id, { rejectWithValue }) => {
    try {
      await schoolsApiService.restoreSchool(id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Status Management
// ============================================================================

/**
 * Update school status (approve, reject, activate, deactivate)
 */
export const updateSchoolStatus = createAsyncThunk<SchoolDetail, UpdateSchoolStatusPayload>(
  'schools/updateSchoolStatus',
  async ({ id, status, reason, notes }, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, status, { reason, notes });
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Approve a school
 */
export const approveSchool = createAsyncThunk<SchoolDetail, { id: string; notes?: string }>(
  'schools/approveSchool',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'approved', { notes });
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Reject a school
 */
export const rejectSchool = createAsyncThunk<SchoolDetail, { id: string; reason: string }>(
  'schools/rejectSchool',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'rejected', { reason });
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Activate a school
 */
export const activateSchool = createAsyncThunk<SchoolDetail, string>(
  'schools/activateSchool',
  async (id, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'active');
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Deactivate a school
 */
export const deactivateSchool = createAsyncThunk<SchoolDetail, string>(
  'schools/deactivateSchool',
  async (id, { rejectWithValue }) => {
    try {
      const school = await schoolsApiService.updateSchoolStatus(id, 'inactive');
      return school;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk operations handler
 */
export const bulkOperation = createAsyncThunk<BulkOperationResult, BulkOperationPayload>(
  'schools/bulkOperation',
  async ({ ids, action, reason }, { rejectWithValue }) => {
    try {
      let result: BulkOperationResult;

      switch (action) {
        case 'delete':
          result = await schoolsApiService.bulkDeleteSchools(ids);
          break;
        case 'approve':
          result = await schoolsApiService.bulkApproveSchools(ids);
          break;
        case 'reject':
          if (!reason) {
            throw new Error('Reason is required for bulk reject');
          }
          result = await schoolsApiService.bulkRejectSchools(ids, reason);
          break;
        default:
          throw new Error(`Unknown bulk action: ${action}`);
      }

      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Bulk delete schools
 */
export const bulkDeleteSchools = createAsyncThunk<BulkOperationResult, string[]>(
  'schools/bulkDeleteSchools',
  async (ids, { rejectWithValue }) => {
    try {
      const result = await schoolsApiService.bulkDeleteSchools(ids);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Bulk approve schools
 */
export const bulkApproveSchools = createAsyncThunk<BulkOperationResult, string[]>(
  'schools/bulkApproveSchools',
  async (ids, { rejectWithValue }) => {
    try {
      const result = await schoolsApiService.bulkApproveSchools(ids);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Bulk reject schools
 */
export const bulkRejectSchools = createAsyncThunk<
  BulkOperationResult,
  { ids: string[]; reason: string }
>('schools/bulkRejectSchools', async ({ ids, reason }, { rejectWithValue }) => {
  try {
    const result = await schoolsApiService.bulkRejectSchools(ids, reason);
    return result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// ============================================================================
// Statistics
// ============================================================================

/**
 * Fetch school statistics
 */
export const fetchSchoolStatistics = createAsyncThunk<SchoolStatisticsResponse, void>(
  'schools/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const statistics = await schoolsApiService.getSchoolStatistics();
      return statistics;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// ============================================================================
// File Operations
// ============================================================================

/**
 * Upload school logo
 */
export const uploadSchoolLogo = createAsyncThunk<{ url: string; path: string }, File>(
  'schools/uploadLogo',
  async (file, { rejectWithValue }) => {
    try {
      const result = await schoolsApiService.uploadSchoolLogo(file);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Upload school document
 */
export const uploadSchoolDocument = createAsyncThunk<{ url: string; path: string }, File>(
  'schools/uploadDocument',
  async (file, { rejectWithValue }) => {
    try {
      const result = await schoolsApiService.uploadSchoolDocument(file);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Bulk import schools
 */
export const bulkImportSchools = createAsyncThunk<BulkOperationResult, File>(
  'schools/bulkImport',
  async (file, { rejectWithValue }) => {
    try {
      const result = await schoolsApiService.bulkImportSchools(file);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Export schools
 */
export const exportSchools = createAsyncThunk<
  Blob,
  { format?: 'csv' | 'excel' | 'pdf'; filters?: SchoolQueryParams }
>('schools/export', async ({ format = 'excel', filters }, { rejectWithValue }) => {
  try {
    const result = await schoolsApiService.exportSchools(format, filters);
    return result;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
