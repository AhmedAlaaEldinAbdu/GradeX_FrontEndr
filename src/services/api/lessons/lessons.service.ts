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

/**
 * Build FormData from CreateLessonRequest
 * The API expects multipart/form-data with PascalCase field names
 */
function buildLessonFormData(data: CreateLessonRequest, attachmentFiles?: File[]): FormData {
  const formData = new FormData();

  // Required fields - use PascalCase for API
  formData.append('MaterialId', data.materialId);
  formData.append('TeacherId', data.teacherId);
  formData.append('BookId', data.bookId);
  formData.append('GradeId', data.gradeId);
  formData.append('ClassroomId', data.classroomId);
  formData.append('SchoolBranchesId', data.schoolBranchesId);
  formData.append('Date', data.date);
  formData.append('StartTime', data.startTime);
  formData.append('EndTime', data.endTime);
  formData.append('ClassworkFromPage', String(data.classworkFromPage));
  formData.append('ClassworkToPage', String(data.classworkToPage));
  formData.append('HomeworkFromPage', String(data.homeworkFromPage));
  formData.append('HomeworkToPage', String(data.homeworkToPage));
  formData.append('IsHomeworkForAllStudents', String(data.isHomeworkForAllStudents));

  // Optional fields
  if (data.lessonsStudent && data.lessonsStudent.length > 0) {
    data.lessonsStudent.forEach((student) => {
      formData.append('LessonsStudent', JSON.stringify(student));
    });
  }
  if (data.homeworkDescriptionAr) {
    formData.append('HomeworkDescriptionAr', data.homeworkDescriptionAr);
  }
  if (data.homeworkDescriptionEn) {
    formData.append('HomeworkDescriptionEn', data.homeworkDescriptionEn);
  }

  // Handle attachments - can be files or attachment metadata
  if (attachmentFiles && attachmentFiles.length > 0) {
    attachmentFiles.forEach((file) => {
      formData.append('Attachments', file);
    });
  } else if (data.attachments) {
    formData.append('Attachments', JSON.stringify(data.attachments));
  }

  return formData;
}

export async function createLesson(
  data: CreateLessonRequest,
  attachmentFiles?: File[]
): Promise<ApiResponseModel<null>> {
  const formData = buildLessonFormData(data, attachmentFiles);

  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    LessonsEndpoints.createLesson,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export async function updateLesson(
  data: UpdateLessonRequest,
  attachmentFiles?: File[]
): Promise<ApiResponseModel<null>> {
  const formData = new FormData();

  const dto = {
    id: data.id,
    lessonsStudent: data.lessonsStudent || [],
    materialId: data.materialId,
    classworkFromPage: data.classworkFromPage,
    bookId: data.bookId,
    endTime: data.endTime,
    homeworkFromPage: data.homeworkFromPage,
    isHomeworkForAllStudents: data.isHomeworkForAllStudents,
    classroomId: data.classroomId,
    date: data.date,
    startTime: data.startTime,
    attachments: data.attachments || [],
    gradeId: data.gradeId,
    classworkToPage: data.classworkToPage,
    homeworkDescriptionEn: data.homeworkDescriptionEn || '',
    homeworkToPage: data.homeworkToPage,
    teacherId: data.teacherId,
    homeworkDescriptionAr: data.homeworkDescriptionAr || '',
    schoolBranchesId: data.schoolBranchesId,
  };

  formData.append('dto', JSON.stringify(dto));

  if (attachmentFiles && attachmentFiles.length > 0) {
    attachmentFiles.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    LessonsEndpoints.updateLesson,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
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
