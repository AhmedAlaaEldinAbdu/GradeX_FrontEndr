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
