/**
 * Schools CRUD Operations
 * Basic Create, Read, Update, Delete operations for schools
 */

import { httpClient } from '@/lib/http';
import { API_ENDPOINTS } from '../config';
import type {
  SchoolListResponse,
  SchoolDetailResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
} from '../types/school.types';
import type { ApiSuccessResponse } from '../config';

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
