import type { Pagination } from '@/types/Pagination';
import type { ApiResponse } from '../config';

// Nested DTOs returned inside each grade item
export interface AcademicSubSystemGradeDto {
  id: string;
  nameEn: string | null;
  nameAr: string | null;
}

export interface AcademicSystemRefDto {
  id: string;
  nameEn: string | null;
  nameAr: string | null;
}

export interface EducationalStageResponse {
  id: string;
  nameAr: string;
  nameEn: string;
  age?: number;
  academicSubSystemGradeId: string;
  academicSubSystemGradeDto?: AcademicSubSystemGradeDto;
  academicSystemsDto?: AcademicSystemRefDto[];
  academicSubSystemId?: string;
  createdDate?: string;
}

export interface EducationalStagesListValue extends Pagination {
  gradeDtos: EducationalStageResponse[];
}

export interface EducationalStageParams {
  pageIndex: number;
  pageSize: number;
  nameAr?: string;
  nameEn?: string;
  acdemicSubsystemId?: string;
  acdemicsystemId?: string;
  schoolBranchId?: string;
  // academicSubSystemId?: string; // backend changed the param name
}

export interface CreateEducationalStageRequest {
  nameAr: string;
  nameEn: string;
  age?: number;
  academicSubSystemId: string;
}

export interface UpdateEducationalStageRequest extends CreateEducationalStageRequest {
  id: string;
}

export type EducationalStagesListResponse = ApiResponse<EducationalStagesListValue>;
export type EducationalStageDetailsResponse = ApiResponse<EducationalStageResponse>;
