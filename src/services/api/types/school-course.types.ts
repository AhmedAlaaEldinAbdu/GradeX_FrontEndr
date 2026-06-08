/**
 * SchoolCourse API types.
 *
 * Wire field names (PascalCase) on the create/update payloads match the API
 * schema verbatim — including the misspelled `SchoolBrancheId` — and must not be
 * "fixed" on the client. The list/detail item shape (`SchoolCourse`) is a
 * best-effort model; tighten it once the backend response is confirmed.
 */

// ============================================================================
// Enums
// ============================================================================

/** Course lifecycle status. Wire values: 1, 2, 3. */
export const SchoolCourseStatus = {
  Active: 1,
  Completed: 2,
  Ended: 3,
} as const;
export type SchoolCourseStatus = (typeof SchoolCourseStatus)[keyof typeof SchoolCourseStatus];

// ============================================================================
// Query params
// ============================================================================

export interface SchoolCourseQueryParams {
  schoolBranchId?: string;
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
  MaterialId?: string;
  ClassRoomId?: string;
  Status?: SchoolCourseStatus;
}

// ============================================================================
// Read models
// ============================================================================

/** A single course as returned by the list / details endpoints. */
export interface SchoolCourse {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  /** Server-relative path, e.g. "Uploads/SchoolCourse/.../cover.jpg". */
  coverImage?: string | null;
  status?: SchoolCourseStatus;
  teacherName?: string | null;
  materialNameAr?: string | null;
  materialNameEn?: string | null;
  studentsCount?: number;
  totalLectures?: number;
  /** Lectures already added to the course (numerator of the progress fraction). */
  addedLecturesCount?: number;
  progressPercentage?: number;
  startDate?: string | null;
  endDate?: string | null;
  /** Present on the details endpoint (used to prefill the edit form). */
  materialId?: string | null;
  teacherId?: string | null;
  lectureDuration?: number;
}

/** The `data` object of the list response. */
export interface SchoolCoursesListData {
  activeCoursesCount: number;
  totalStudentsCount: number;
  schoolCourses: SchoolCourse[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/** Envelope shared by the SchoolCourse endpoints. */
export interface SchoolCourseApiEnvelope<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export type SchoolCoursesListResponse = SchoolCourseApiEnvelope<SchoolCoursesListData>;
export type SchoolCourseDetailsResponse = SchoolCourseApiEnvelope<SchoolCourse>;

// ============================================================================
// Write models (multipart/form-data)
// ============================================================================

export interface SchoolCourseLecturePayload {
  nameAr: string;
  nameEn: string;
  /** Lecture duration in minutes. */
  duration?: number;
  video?: File | null;
  attachments?: File[];
}

export interface CreateSchoolCourseRequest {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  /** ISO date-time string. */
  startDate: string;
  /** ISO date-time string. */
  endDate?: string;
  materialId: string;
  teacherId: string;
  /** Sent on the wire as `SchoolBrancheId` (API spelling). */
  schoolBranchId: string;
  totalLectures: number;
  lectureDuration?: number;
  coverImage?: File | null;
  classRoomIds?: string[];
  studentIds?: string[];
  isCourseForAllStudents: boolean;
  lectures?: SchoolCourseLecturePayload[];
}

export interface UpdateSchoolCourseRequest extends CreateSchoolCourseRequest {
  id: string;
}
