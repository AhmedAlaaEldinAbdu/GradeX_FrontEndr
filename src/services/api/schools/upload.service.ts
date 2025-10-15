/**
 * Schools File Upload Service
 * Handle file uploads for schools
 */

import { httpClient } from '@/lib/http';
import type { BulkOperationResponse } from '../types/school.types';
import type { ApiSuccessResponse } from '../config';

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
