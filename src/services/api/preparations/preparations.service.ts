import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { PreparationEndpoints } from '../endpoints/preparations.endpoints';
import type {
  PreparationListResponse,
  PreparationQueryParams,
  CreatePreparationRequest,
} from '@/types/preparations';

/**
 * Get list of preparations with pagination and filters
 */
export async function getPreparations(
  params?: PreparationQueryParams
): Promise<PreparationListResponse> {
  const response: AxiosResponse<PreparationListResponse> = await axiosClient.get(
    PreparationEndpoints.getPreparations,
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
        preparations: [],
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

export async function createPreparation(
  data: CreatePreparationRequest
): Promise<{ success: boolean; message: string; data?: any }> {
  const formData = new FormData();

  if (data.schoolBranchId) formData.append('SchoolBrancheId', data.schoolBranchId);
  if (data.preparationDate) formData.append('PreparationDate', data.preparationDate);
  if (data.gradeId) formData.append('GradeId', data.gradeId);

  if (data.classRoomIds && data.classRoomIds.length > 0) {
    data.classRoomIds.forEach((id) => formData.append('ClassRoomIds', id));
  }

  if (data.materialId) formData.append('MaterialId', data.materialId);
  if (data.topic) formData.append('Topic', data.topic);
  if (data.content) formData.append('Content', data.content);

  if (data.bookId) formData.append('BookId', data.bookId);
  if (data.bookName) formData.append('BookName', data.bookName);
  if (data.fromPage !== undefined) formData.append('FromPage', String(data.fromPage));
  if (data.toPage !== undefined) formData.append('ToPage', String(data.toPage));

  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((file) => formData.append('Attachments', file));
  }

  const response: AxiosResponse<any> = await axiosClient.post(
    PreparationEndpoints.addPreparation,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    success: response.data?.isSuccess,
    message: response.data?.message || 'Created successfully',
    data: response.data?.data,
  };
}

export const preparationApiService = {
  getPreparations,
  createPreparation,
};

export default preparationApiService;
