import type { Pagination } from '@/types/Pagination';
import type { ApiResponse } from '../config';

export interface EducationalStageResponse {
  id: string;
  nameAr: string;
  nameEn: string;
  age?: number;
  academicSubSystemId: string;
  created?: string;
}

export interface EducationalStagesListValue extends Pagination {
  gradeDtos: EducationalStageResponse[];
}

export interface EducationalStageParams {
  pageIndex: number;
  pageSize: number;
  name?: string;
  academicSubSystemId?: string;
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
