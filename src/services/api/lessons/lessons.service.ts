/**
 * Lessons API Service
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { LessonsEndpoints } from '../endpoints/lessons-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  LessonsListResponse,
  LessonsQueryParams,
  Lesson,
  CreateLessonRequest,
  UpdateLessonRequest,
} from '../types/lessons.types';

const serializeParams = (params?: LessonsQueryParams) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

export async function getLessons(params?: LessonsQueryParams): Promise<LessonsListResponse> {
  const response: AxiosResponse<LessonsListResponse> = await axiosClient.get(
    LessonsEndpoints.getLessons,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        lessons: [],
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export async function getLessonById(id: string): Promise<Lesson> {
  const response: AxiosResponse<ApiResponseModel<Lesson>> = await axiosClient.get(
    LessonsEndpoints.getLessonById(id)
  );

  if (response.data.data) {
    return response.data.data;
  }

  return response.data.value as Lesson;
}

export async function createLesson(data: CreateLessonRequest): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    LessonsEndpoints.createLesson,
    data
  );
  return response.data;
}

export async function updateLesson(data: UpdateLessonRequest): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    LessonsEndpoints.updateLesson,
    data
  );
  return response.data;
}

export async function deleteLesson(id: string): Promise<ApiResponseModel<null>> {
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.delete(
    LessonsEndpoints.deleteLesson(id)
  );
  return response.data;
}

export const lessonsApiService = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};

export default lessonsApiService;
