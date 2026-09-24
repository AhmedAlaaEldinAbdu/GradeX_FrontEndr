import type { ApiResponseModel } from '../config';

export interface GradeAcademicSubSystemDto {
  id: string;
  nameEn: string | null;
  nameAr: string | null;
}

export interface GradeAcademicSystemDto {
  id: string;
  nameEn: string | null;
  nameAr: string | null;
}

export interface GradeDto {
  id: string;
  nameAr: string;
  nameEn: string;
  age: number;
  classroomCount?: number;
  classroomPrecentage?: number;
  createdDate?: string;
  lkSchoolStageId?: string | null;
  lkSchoolStageNameAr?: string | null;
  lkSchoolStageNameEn?: string | null;
  academicSubSystemGradeId?: string | null;
  academicSubSystemGradeDto?: GradeAcademicSubSystemDto | null;
  academicSystemsDto?: GradeAcademicSystemDto[];
}

export interface GradeDetailsDto extends GradeDto {}

export interface GradeListData {
  gradeDtos: GradeDto[];
  totalStudentsCount?: number;
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export type GradeListResponse = ApiResponseModel<GradeListData>;
export type GradeDetailsResponse = ApiResponseModel<GradeDetailsDto>;

export interface GradeQueryParams {
  PageIndex?: number;
  PageSize?: number;
  NameAr?: string;
  NameEn?: string;
  AcdemicSubsystemId?: string;
  AcdemicsystemId?: string;
  SchoolBranchId?: string;
}

// ============================================================================
// Stages With Grades (grouped overview)
// ============================================================================

export interface StageGradeDto {
  gradeId: string;
  gradeName: string;
  academicSubSystemId: string;
  academicSubSystemName: string;
  classroomsCount: number;
  studentsCount: number;
  classroomsPercentage: number;
}

export interface StageWithGradesDto {
  lkSchoolStageId: string;
  stageName: string;
  gradesCount: number;
  classroomsCount: number;
  studentsCount: number;
  grades: StageGradeDto[];
}

export interface StagesWithGradesData {
  totalStages: number;
  totalGrades: number;
  totalClassrooms: number;
  totalStudents: number;
  stages: StageWithGradesDto[];
}

export interface StagesWithGradesResponse {
  data: StagesWithGradesData;
  isSuccess: boolean;
  message: string;
  errorCode: string | null;
  validationErrors: unknown;
}

export interface StagesWithGradesQueryParams {
  SchoolBranchId?: string;
}
