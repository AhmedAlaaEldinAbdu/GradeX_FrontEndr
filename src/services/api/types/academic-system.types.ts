import type { Pagination } from '@/types/Pagination';
import type { Country } from './lookup.types';
import type { ApiResponse } from '../config';


export interface AcademicSystemListValue extends Pagination {
  academicSubSystemResponse: AcademicSubSystemResponse[];
}

export interface AcademicSystemDetailsValue {
  id: string;
  nameAr: string;
  nameEn: string;
  academicSubSystemDto: AcademicSubSystemDto[];
  lkCountriesDto: Country[];
}

export interface AcademicSubSystemResponse {
  nameAr: string;
  nameEn: string;
  id: string;
  academicSubSystemDto: AcademicSubSystemDto[];
  lkCountriesDto: Country[];
  created: string;
  gradeCount: number;
}

export interface AcademicSubSystemDto {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface AcademicSubSystemParams {
  pageIndex: number;
  pageSize: number;
  academicSubSystemName?: string;
  nameAr?: string;
  nameEn?: string;
  subsystemId?: string;
  countryId?: string;
  schoolBranchId?: string;
}

export interface CreateAcademicSystem {
  nameAr: string;
  nameEn: string;
  subSystemIds: string[];
  countryIds: string[];
}

export interface UpdateAcademicSystemRequest extends CreateAcademicSystem {
  id: string;
}

export type AcademicSystemListResponse = ApiResponse<AcademicSystemListValue>;
export type AcademicSystemDetailsResponse = ApiResponse<AcademicSystemDetailsValue>;
