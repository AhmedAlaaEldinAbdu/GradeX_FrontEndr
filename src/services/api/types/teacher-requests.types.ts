/**
 * TeacherRequests Types
 * Type definitions for the TeacherRequests controller (الطلبات الإدارية).
 *
 * TODO(api): The response DTOs below are placeholders. Replace the `unknown`
 * index signatures with the real fields once the API response schemas are
 * provided. Query params and request bodies already match the swagger spec.
 */
import type { ApiResponseModel } from '../config';

// ============================================================================
// Enums (values per swagger; labels are confirmed when responses are provided)
// ============================================================================

/** Apply-job-advertisement application status. Backend enum values: 1–6. */
export type TeacherApplicationStatus = 1 | 2 | 3 | 4 | 5 | 6;
export const TEACHER_APPLICATION_STATUS_VALUES: TeacherApplicationStatus[] = [1, 2, 3, 4, 5, 6];
export const TeacherApplicationStatusMap = {
  Accept: 1,           // مقبول
  Reject: 2,           // مرفوض
  Pending: 3,          // قيد المراجعة
  Cancelled: 4,        // تم الالغاء
  Archived: 5,         // مؤرشف
  InterviewScheduled: 6 // تم تحديد مقابلة
} as const;

/** Work schedule (WorkShedule). Swagger values: 1–3. */
export type TeacherWorkSchedule = 1 | 2 | 3;
export const TEACHER_WORK_SCHEDULE_VALUES: TeacherWorkSchedule[] = [1, 2, 3];

/** Early-leave request status (RequestStatus / update-status). Swagger values: 1–3. */
export type EarlyLeaveRequestStatus = 1 | 2 | 3;
export const EARLY_LEAVE_REQUEST_STATUS_VALUES: EarlyLeaveRequestStatus[] = [1, 2, 3];

// ============================================================================
// Query params (PascalCase to match swagger query keys)
// ============================================================================

export interface TeacherRequestsSummaryParams {
  SchoolBranchId?: string;
}

export interface JobApplicationsQueryParams {
  SchoolBranchId?: string;
  ApplicationStatus?: TeacherApplicationStatus;
  TeacherName?: string;
  JobAdvertismentId?: string;
  WorkShedule?: TeacherWorkSchedule;
  QualificationId?: string;
  YearsExperience?: number;
  NationalityId?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface EarlyLeaveQueryParams {
  SchoolBranchId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTeacherName?: string;
  RequestStatus?: EarlyLeaveRequestStatus;
  /** ISO date-time string. */
  Date?: string;
}

export interface TeacherMessagesQueryParams {
  SchoolBranchId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTeacherName?: string;
  /** ISO date-time string. */
  Date?: string;
}

export interface TeacherNotesQueryParams {
  SchoolBranchId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchTeacherName?: string;
  /** ISO date-time string. */
  Date?: string;
}

// ============================================================================
// Request bodies
// ============================================================================

export interface UpdateEarlyLeaveStatusRequest {
  id: string;
  status: EarlyLeaveRequestStatus;
}

// ============================================================================
// Response DTOs (placeholders — TODO: fill from API responses)
// ============================================================================

export interface TeacherRequestsSummaryDto {
  totalRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  pendingRequests: number;
}

/** Lookup item embedded in job-application responses (countries, qualifications). */
export interface JobAdvertisementLookupItem {
  id: string;
  nameAr: string | null;
  nameEn: string | null;
}

export interface JobApplicationQualificationDto {
  id: string;
  lkQualificationId: string;
  qualificationNameAr: string;
  qualificationNameEn: string;
  countryUniversityId: string;
  countryUniversityNameAr: string;
  countryUniversityNameEn: string;
  graduationYear: number;
  lkUniversityId: string;
  universityNameAr: string;
  universityNameEn: string;
  college: string;
}

export interface JobApplicationExperienceAttachmentDto {
  id: string;
  file: string;
}

export interface JobApplicationExperienceDto {
  id: string;
  lkTeacherLevelId: string;
  teacherLevelNameAr: string;
  teacherLevelNameEn: string;
  schoolName: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
  attachments: JobApplicationExperienceAttachmentDto[];
}

export interface JobApplicationLanguageDto {
  id: string;
  lkLanguageId: string;
  lkLanguageNameAr: string;
  lkLanguageNameEn: string;
  lkLanguageLevelId: string;
  lkLanguageLevelNameAr: string;
  lkLanguageLevelNameEn: string;
}

export interface JobApplicationCourseDto {
  id: string;
  name: string;
  providerName: string;
  startDate: string;
  endDate: string;
  certificateImage: string;
}

/** A single row from `GET /TeacherRequests/apply-job-advertisment`. */
export interface JobApplicationRequestDto {
  applicationJobAdvertismentId: string;
  jobAdvertismentId: string;
  jobAdvertismentNameAr: string | null;
  jobAdvertismentNameEn: string | null;
  teacherId: string;
  teacherFullName: string;
  teacherEmail: string;
  teacherPhoneNumber: string;
  teacherPictureProfilePath: string | null;
  pictureProfilePath?: string | null;
  yearsExperience: number;
  resumeFile: string | null;
  workShedule: TeacherWorkSchedule;
  address: string | null;
  lkCountryId: string | null;
  lkCountryNameAr: string | null;
  lkCountryNameEn: string | null;
  nationalityId: string | null;
  applicationStatus: number;
  nationalityNameAr: string | null;
  nationalityNameEn: string | null;
  nationality: number | null;
  jobAdvertisementCountries: JobAdvertisementLookupItem[];
  jobAdvertisementQualifications: JobAdvertisementLookupItem[];

  // Details response fields from `GET /TeacherRequests/apply-job-advertisment/{id}`
  phoneNumber?: string;
  email?: string;
  nationalIdentityNumber?: string;
  birthDate?: string;
  identityType?: number;
  identityTypeNameAr?: string;
  identityTypeNameEn?: string;
  socialStatus?: number;
  socialStatusNameAr?: string;
  socialStatusNameEn?: string;
  qualifications?: JobApplicationQualificationDto[];
  experience?: JobApplicationExperienceDto[];
  languages?: JobApplicationLanguageDto[];
  courses?: JobApplicationCourseDto[];
}

export interface EarlyLeaveAttachmentDto {
  id: string;
  filePath: string;
  fileName: string;
}

export interface EarlyLeaveRequestDto {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // DateTime
  fromTime: string; // TimeSpan (HH:mm:ss)
  toTime: string; // TimeSpan (HH:mm:ss)
  duration: string; // TimeSpan (HH:mm:ss)
  reason: string;
  requestStatus: EarlyLeaveRequestStatus; // 1 = Pending, 2 = Approved, 3 = Rejected
  attachments: EarlyLeaveAttachmentDto[];
}

/** A single row from `GET /TeacherRequests/teacher-request-messages`. */
export interface TeacherMessageDto {
  id: string;
  schoolBranchId: string;
  schoolBranchNameAr: string;
  schoolBranchNameEn: string;
  teacherId: string;
  teacherName: string;
  grades: unknown[]; // TODO(api): define grade type if needed
  classrooms: unknown[]; // TODO(api): define classroom type if needed
  receivers: unknown[]; // TODO(api): define receiver type if needed
  message: string;
  createdAt: string;
  sendType: number;
}

export interface TeacherNoteDto {
  id: string;
  // TODO(api): replace with the real note fields.
  [key: string]: unknown;
}

// ============================================================================
// Paginated list wrapper
// ============================================================================

/** Shared pagination metadata returned alongside every list payload. */
export interface PaginationMeta {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Generic paginated payload for endpoints whose response schema is not yet
 * provided; list items are exposed under `items` until confirmed.
 */
export interface PaginatedList<T> extends PaginationMeta {
  items: T[];
}

/** Payload of `GET /TeacherRequests/apply-job-advertisment`. */
export interface JobApplicationsListData extends PaginationMeta {
  teacherRequestsApplyJobAdvertisments: JobApplicationRequestDto[];
  total: number;
  totalAccepted: number;
  totalRejected: number;
  totalPending: number;
  totalCancelled: number;
  totalArchived: number;
  totalInterviewScheduled: number;
}

/** Payload of `GET /TeacherRequests/teacher-request-messages`. */
export interface TeacherMessagesListData extends PaginationMeta {
  teacherRequestMessages: TeacherMessageDto[];
}

/** Payload of `GET /TeacherRequestEarlyLeave`. */
export interface EarlyLeavesListData extends PaginationMeta {
  teacherRequestsEarlyLeaves: EarlyLeaveRequestDto[];
  totalRequests: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
}

export type TeacherRequestsSummaryResponse = ApiResponseModel<TeacherRequestsSummaryDto>;
export type JobApplicationsListResponse = ApiResponseModel<JobApplicationsListData>;
export type JobApplicationResponse = ApiResponseModel<JobApplicationRequestDto>;
export type EarlyLeavesListResponse = ApiResponseModel<EarlyLeavesListData>;
export type EarlyLeaveResponse = ApiResponseModel<EarlyLeaveRequestDto>;
export type TeacherMessagesListResponse = ApiResponseModel<TeacherMessagesListData>;
export type TeacherMessageResponse = ApiResponseModel<TeacherMessageDto>;
export type TeacherNotesListResponse = ApiResponseModel<PaginatedList<TeacherNoteDto>>;
export type TeacherNoteResponse = ApiResponseModel<TeacherNoteDto>;
