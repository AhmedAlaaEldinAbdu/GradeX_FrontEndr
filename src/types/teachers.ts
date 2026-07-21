/**
 * Centralized Teacher Constants
 * Single source of truth for all teacher-related constants in the application
 */

export const QualificationType = {
  TYPE_1: 1,
  TYPE_2: 2,
} as const;

export type QualificationTypeValue = (typeof QualificationType)[keyof typeof QualificationType];

/**
 * Qualification Type display names for UI
 */
export const QualificationTypeDisplayNames: Record<QualificationTypeValue, string> = {
  [QualificationType.TYPE_1]: 'Qualification Type 1',
  [QualificationType.TYPE_2]: 'Qualification Type 2',
};

// ============================================================================
// Types
// ============================================================================

export interface TeacherSubject {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface TeacherEducationalStage {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface TeacherClassroom {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface TeacherClassroomAssignment {
  classroomId: string;
  classroomName: string;
}

export interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  lkCountryId: string | null;
  countryName: string | null;
  appLanguage?: number;
  userType?: number;
  email: string;
  countryCode: string | null;
  phoneNumber: string | null;
  cityId?: string | null;
  cityName?: string | null;
  regionId?: string | null;
  regionName?: string | null;
  districtName?: string | null;
  streetName?: string | null;
  buildingNumber?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationUrl?: string | null;
  token?: string;
  phoneNumberConfirmed?: boolean;
  pictureProfilePath: string | null;
  job: number;
  berthDate: string | null;
  nationalityId: string | null;
  nationalityName: string | null;
  materialId?: string | null;
  materialName?: string | null;
  gradeId?: string | null;
  gradeName?: string | null;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectNameAr?: string | null;
  subjectNameEn?: string | null;
  subjects?: TeacherSubject[];
  educationalStages?: TeacherEducationalStage[];
  classrooms?: TeacherClassroom[] | TeacherClassroomAssignment[];
}

export interface TeacherListData {
  teachers: Teacher[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface TeacherListResponse {
  data: TeacherListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface TeacherQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SearchTerm?: string;
  ClassroomId?: string;
  SchoolBranchId?: string;
  QualificationType?: number;
  GradeId?: string;
  MaterialId?: string;
  Language?: string;
}

export interface TeacherFilters {
  SearchTerm?: string;
  classroomId?: string;
  gradeId?: string;
  materialId?: string;
  qualificationType?: number;
  schoolBranchId?: string;
  schoolBranchesId?: string;
  SchoolBranchId?: string;
  Language?: string;
}
