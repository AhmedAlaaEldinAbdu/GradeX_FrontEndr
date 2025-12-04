/**
 * Subject (Material) API Service
 * Handles all API calls related to subject/material management using Axios
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { SubjectEndpoints } from '../endpoints/subject-endpoints';
import type {
  Subject,
  SubjectListResponse,
  SubjectQueryParams,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from '@/types/subjects';

// ============================================================================
// Subject CRUD Operations
// ============================================================================

/**
 * Get list of subjects with pagination and filters
 */
export async function getSubjects(params?: SubjectQueryParams): Promise<SubjectListResponse> {
  const response: AxiosResponse<SubjectListResponse> = await axiosClient.get(
    SubjectEndpoints.getSubjects,
    {
      params,
      paramsSerializer: {
        serialize: (params) => {
          const searchParams = new URLSearchParams();

          Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, String(v)));
            } else {
              searchParams.append(key, String(value));
            }
          });

          return searchParams.toString();
        },
      },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        materialDto: [],
        totalItems: 0,
        totalPages: 0,
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

/**
 * Get subject by ID
 */
export async function getSubjectById(id: string): Promise<Subject> {
  const response: AxiosResponse<{
    data: Subject;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.get(SubjectEndpoints.getSubjectById(id));

  return response.data.data;
}

/**
 * Create new subject
 */
export async function createSubject(data: CreateSubjectRequest): Promise<Subject> {
  const response: AxiosResponse<{
    data: Subject;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.post(SubjectEndpoints.addSubject, data);

  // Check if the response indicates validation errors
  if (
    !response.data.isSuccess &&
    response.data.validationErrors &&
    response.data.validationErrors.length > 0
  ) {
    const error = new Error('Validation failed') as Error & {
      validationErrors: typeof response.data.validationErrors;
      isValidationError: boolean;
    };
    error.validationErrors = response.data.validationErrors;
    error.isValidationError = true;
    throw error;
  }

  return response.data.data;
}

/**
 * Update an existing subject
 */
export async function updateSubject(id: string, data: UpdateSubjectRequest): Promise<Subject> {
  const response: AxiosResponse<{
    data: Subject;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.put(SubjectEndpoints.editSubject(id), data);

  // Check if the response indicates validation errors
  if (
    !response.data.isSuccess &&
    response.data.validationErrors &&
    response.data.validationErrors.length > 0
  ) {
    const error = new Error('Validation failed') as Error & {
      validationErrors: typeof response.data.validationErrors;
      isValidationError: boolean;
    };
    error.validationErrors = response.data.validationErrors;
    error.isValidationError = true;
    throw error;
  }

  return response.data.data;
}

/**
 * Delete a subject
 */
export async function deleteSubject(id: string): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<{
    data: string | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.delete(SubjectEndpoints.deleteSubject(id));

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Subject deleted successfully',
  };
}

// ============================================================================
// Export All Services
// ============================================================================

export const subjectApiService = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};

export default subjectApiService;
