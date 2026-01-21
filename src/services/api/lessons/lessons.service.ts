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

  // Convert date from YYYY-MM-DD or ISO format to MM-DD-YYYY format
  let formattedDate = '';
  if (data.date) {
    const dateStr = data.date.split('T')[0]; // Handle ISO format
    const dateParts = dateStr.split('-');
    if (dateParts.length === 3) {
      formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`; // MM-DD-YYYY
    }
  }

  // Format time to HH:MM:SS
  const formatTime = (time?: string): string => {
    if (!time) return '00:00:00';
    // If already has seconds, return as is
    if (time.split(':').length === 3) return time;
    // Add seconds
    return `${time}:00`;
  };

  // Required fields with dto[0]. prefix
  formData.append('dto[0].Id', data.id);
  if (data.materialId) formData.append('dto[0].materialId', data.materialId);
  if (data.bookId) formData.append('dto[0].bookId', data.bookId);
  if (data.gradeId) formData.append('dto[0].gradeId', data.gradeId);
  if (data.classroomId) formData.append('dto[0].classroomId', data.classroomId);
  if (data.teacherId) formData.append('dto[0].teacherId', data.teacherId);
  if (data.schoolBranchesId) formData.append('dto[0].schoolBranchesId', data.schoolBranchesId);

  // Date and time
  if (formattedDate) formData.append('dto[0].date', formattedDate);
  formData.append('dto[0].startTime', formatTime(data.startTime));
  formData.append('dto[0].endTime', formatTime(data.endTime));

  // Page numbers
  formData.append('dto[0].classworkFromPage', String(data.classworkFromPage ?? 0));
  formData.append('dto[0].classworkToPage', String(data.classworkToPage ?? 0));
  formData.append('dto[0].homeworkFromPage', String(data.homeworkFromPage ?? 0));
  formData.append('dto[0].homeworkToPage', String(data.homeworkToPage ?? 0));

  // Boolean and descriptions
  formData.append('dto[0].isHomeworkForAllStudents', String(data.isHomeworkForAllStudents ?? true));
  if (data.homeworkDescriptionEn)
    formData.append('dto[0].homeworkDescriptionEn', data.homeworkDescriptionEn);
  if (data.homeworkDescriptionAr)
    formData.append('dto[0].homeworkDescriptionAr', data.homeworkDescriptionAr);

  // Handle lessonsStudent array
  if (data.lessonsStudent && data.lessonsStudent.length > 0) {
    data.lessonsStudent.forEach((student, index) => {
      formData.append(`dto[0].lessonsStudent[${index}].studentId`, student.studentId);
    });
  } else {
    // Include empty student if no students selected
    formData.append('dto[0].lessonsStudent[0].studentId', '');
  }

  // Handle attachments
  if (attachmentFiles && attachmentFiles.length > 0) {
    // New file attachments
    attachmentFiles.forEach((file, index) => {
      formData.append(`dto[0].attachments[${index}].fileName`, file.name.replace(/\.[^/.]+$/, ''));
      formData.append(`dto[0].attachments[${index}].fileUrl`, file);
    });
  } else if (data.attachments && data.attachments.length > 0) {
    // Existing attachments metadata
    data.attachments.forEach((attachment, index) => {
      formData.append(`dto[0].attachments[${index}].fileName`, attachment.fileName);
      if (attachment.fileUrl) {
        formData.append(`dto[0].attachments[${index}].fileUrl`, attachment.fileUrl);
      }
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

/**
 * Bulk update multiple lessons in a single API call
 * Uses array-indexed form-data format: dto[0].fieldName, dto[1].fieldName, etc.
 */
export async function bulkUpdateLessons(
  lessonsData: UpdateLessonRequest[]
): Promise<ApiResponseModel<null>> {
  const formData = new FormData();

  lessonsData.forEach((data, lessonIndex) => {
    const prefix = `dto[${lessonIndex}]`;

    // Convert date from YYYY-MM-DD or ISO format to MM-DD-YYYY format
    let formattedDate = '';
    if (data.date) {
      const dateStr = data.date.split('T')[0]; // Handle ISO format
      const dateParts = dateStr.split('-');
      if (dateParts.length === 3) {
        formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`; // MM-DD-YYYY
      }
    }

    // Format time to HH:MM:SS
    const formatTime = (time?: string): string => {
      if (!time) return '00:00:00';
      if (time.split(':').length === 3) return time;
      return `${time}:00`;
    };

    // Required fields
    formData.append(`${prefix}.Id`, data.id);
    if (data.materialId) formData.append(`${prefix}.materialId`, data.materialId);
    if (data.bookId) formData.append(`${prefix}.bookId`, data.bookId);
    if (data.gradeId) formData.append(`${prefix}.gradeId`, data.gradeId);
    if (data.classroomId) formData.append(`${prefix}.classroomId`, data.classroomId);
    if (data.teacherId) formData.append(`${prefix}.teacherId`, data.teacherId);
    if (data.schoolBranchesId) formData.append(`${prefix}.schoolBranchesId`, data.schoolBranchesId);

    // Date and time
    if (formattedDate) formData.append(`${prefix}.date`, formattedDate);
    formData.append(`${prefix}.startTime`, formatTime(data.startTime));
    formData.append(`${prefix}.endTime`, formatTime(data.endTime));

    // Page numbers
    formData.append(`${prefix}.classworkFromPage`, String(data.classworkFromPage ?? 0));
    formData.append(`${prefix}.classworkToPage`, String(data.classworkToPage ?? 0));
    formData.append(`${prefix}.homeworkFromPage`, String(data.homeworkFromPage ?? 0));
    formData.append(`${prefix}.homeworkToPage`, String(data.homeworkToPage ?? 0));

    // Boolean and descriptions
    formData.append(
      `${prefix}.isHomeworkForAllStudents`,
      String(data.isHomeworkForAllStudents ?? true)
    );
    if (data.homeworkDescriptionEn)
      formData.append(`${prefix}.homeworkDescriptionEn`, data.homeworkDescriptionEn);
    if (data.homeworkDescriptionAr)
      formData.append(`${prefix}.homeworkDescriptionAr`, data.homeworkDescriptionAr);

    // Handle lessonsStudent array
    if (data.lessonsStudent && data.lessonsStudent.length > 0) {
      data.lessonsStudent.forEach((student, studentIndex) => {
        formData.append(`${prefix}.lessonsStudent[${studentIndex}].studentId`, student.studentId);
      });
    } else {
      formData.append(`${prefix}.lessonsStudent[0].studentId`, '');
    }

    // Handle attachments (metadata only for bulk update, no file uploads)
    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((attachment, attachmentIndex) => {
        formData.append(`${prefix}.attachments[${attachmentIndex}].fileName`, attachment.fileName);
        if (attachment.fileUrl) {
          formData.append(`${prefix}.attachments[${attachmentIndex}].fileUrl`, attachment.fileUrl);
        }
      });
    }
  });

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
  bulkUpdateLessons,
  deleteLesson,
};

export default lessonsApiService;
