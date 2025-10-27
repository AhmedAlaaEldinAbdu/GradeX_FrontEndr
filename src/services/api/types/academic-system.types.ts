import type { Pagination } from '@/types/Pagination';
import type { Country } from './lookup.types';
import type { ApiResponse } from '../config';


export interface AcademicSystemListValue extends Pagination {
  academicSubSystemResponse: AcademicSubSystemResponse[];
}

export interface AcademicSystemDetailsValue {
  type: number;
  id: string;
  academicSubSystemDto: AcademicSubSystemDto[];
  lkCountriesDto: Country[];
}

export interface AcademicSubSystemResponse {
  type?: number;
  name?: string;
  id: string;
  academicSubSystemDto: AcademicSubSystemDto[];
  lkCountriesDto: Country[];
}

export interface AcademicSubSystemDto {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface AcademicSubSystemParams {
  pageIndex: number;
  pageSize: number;
  type?: number;
  name?: string;
  subsystemId?: string;
  countryId?: string;
}

export interface CreateAcademicSystem {
  type: number;
  name?: string;
  subSystemIds: string[];
  countryIds: string[];
}

export interface UpdateAcademicSystemRequest extends CreateAcademicSystem {
  id: string;
}

export type AcademicSystemListResponse = ApiResponse<AcademicSystemListValue>;
export type AcademicSystemDetailsResponse = ApiResponse<AcademicSystemDetailsValue>;
