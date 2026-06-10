/**
 * SchoolCourse API Service
 * Handles all API calls related to training-course (SchoolCourse) management.
 */

import type { AxiosResponse } from 'axios';
import { axiosClient } from '@/lib/http';
import SchoolCourseEndpoints from '../endpoints/school-course-endpoints';
import type {
  CreateSchoolCourseRequest,
  UpdateSchoolCourseRequest,
  SchoolCourseQueryParams,
  SchoolCoursesListResponse,
  SchoolCourseDetailsResponse,
} from '../types/school-course.types';

/**
 * Build the multipart/form-data body shared by the create/update endpoints.
 * Wire field names match the API schema verbatim (PascalCase, and the misspelled
 * `SchoolBrancheId`) — don't "fix" them on the client.
 */
const buildSchoolCourseFormData = (
  data: CreateSchoolCourseRequest | UpdateSchoolCourseRequest
): FormData => {
  const fd = new FormData();

  // `Id` is sent as the query parameter on update (?Id=…), not in the body.
  fd.append('NameAr', data.nameAr);
  fd.append('NameEn', data.nameEn);
  if (data.descriptionAr != null) fd.append('DescriptionAr', data.descriptionAr);
  if (data.descriptionEn != null) fd.append('DescriptionEn', data.descriptionEn);
  fd.append('StartDate', data.startDate);
  if (data.endDate) fd.append('EndDate', data.endDate);
  fd.append('MaterialId', data.materialId);
  fd.append('TeacherId', data.teacherId);
  // API wire field is misspelled "SchoolBrancheId" — match it verbatim.
  fd.append('SchoolBrancheId', data.schoolBranchId);
  fd.append('TotalLectures', String(data.totalLectures));
  if (data.lectureDuration != null) fd.append('LectureDuration', String(data.lectureDuration));
  if (data.coverImage) fd.append('CoverImage', data.coverImage);

  // Simple string arrays: repeat the key so ASP.NET model-binding rebuilds the list.
  (data.classRoomIds ?? []).forEach((id) => fd.append('ClassRoomIds', id));
  (data.studentIds ?? []).forEach((id) => fd.append('StudentIds', id));

  fd.append('IsCourseForAllStudents', String(data.isCourseForAllStudents));

  // Lectures are an array of complex DTOs — serialize each field with bracket
  // notation so the list can be rebuilt server-side.
  (data.lectures ?? []).forEach((lecture, index) => {
    if (lecture.id) fd.append(`Lectures[${index}].Id`, lecture.id);
    fd.append(`Lectures[${index}].NameAr`, lecture.nameAr);
    fd.append(`Lectures[${index}].NameEn`, lecture.nameEn);
    if (lecture.durationInMinutes != null) {
      fd.append(`Lectures[${index}].DurationInMinutes`, String(lecture.durationInMinutes));
    }
    if (lecture.videoDurationInSeconds != null) {
      fd.append(`Lectures[${index}].VideoDurationInSeconds`, String(lecture.videoDurationInSeconds));
    }
    fd.append(`Lectures[${index}].SortOrder`, String(lecture.sortOrder ?? index));
    if (lecture.sourceType != null) {
      fd.append(`Lectures[${index}].SourceType`, String(lecture.sourceType));
    }
    if (lecture.video) fd.append(`Lectures[${index}].Video`, lecture.video);
    (lecture.attachments ?? []).forEach((file) =>
      fd.append(`Lectures[${index}].Attachments`, file)
    );
  });

  return fd;
};

/**
 * GET /api/SchoolCourse — paginated list + summary counts.
 */
export async function getSchoolCourses(
  params?: SchoolCourseQueryParams
): Promise<SchoolCoursesListResponse> {
  const response: AxiosResponse<SchoolCoursesListResponse> = await axiosClient.get(
    SchoolCourseEndpoints.getAll,
    {
      params,
      paramsSerializer: {
        serialize: (raw) => {
          const search = new URLSearchParams();
          Object.entries(raw).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            search.append(key, String(value));
          });
          return search.toString();
        },
      },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        activeCoursesCount: 0,
        totalStudentsCount: 0,
        schoolCourses: [],
        pageIndex: params?.PageNumber ?? 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: params?.PageSize ?? 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

/**
 * GET /api/SchoolCourse/{Id} — single course details.
 */
export async function getSchoolCourseById(id: string): Promise<SchoolCourseDetailsResponse> {
  const response: AxiosResponse<SchoolCourseDetailsResponse> = await axiosClient.get(
    SchoolCourseEndpoints.getById(id)
  );
  return response.data;
}

/**
 * POST /api/SchoolCourse — create a course (multipart/form-data).
 */
export async function createSchoolCourse(
  data: CreateSchoolCourseRequest
): Promise<SchoolCourseDetailsResponse> {
  const response: AxiosResponse<SchoolCourseDetailsResponse> = await axiosClient.post(
    SchoolCourseEndpoints.create,
    buildSchoolCourseFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

/**
 * PUT /api/SchoolCourse?Id={id} — update a course (multipart/form-data).
 */
export async function updateSchoolCourse(
  data: UpdateSchoolCourseRequest
): Promise<SchoolCourseDetailsResponse> {
  const response: AxiosResponse<SchoolCourseDetailsResponse> = await axiosClient.put(
    SchoolCourseEndpoints.update(data.id),
    buildSchoolCourseFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export const schoolCourseApiService = {
  getSchoolCourses,
  getSchoolCourseById,
  createSchoolCourse,
  updateSchoolCourse,
};

export default schoolCourseApiService;
