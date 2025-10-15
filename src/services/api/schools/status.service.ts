/**
 * Schools Status Management
 * Handle school status operations (pending, approved, rejected, etc.)
 */

import { httpClient } from '@/lib/http';
import { API_ENDPOINTS } from '../config';
import type { SchoolListResponse, SchoolDetailResponse } from '../types/school.types';
import type { ApiSuccessResponse } from '../config';

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
