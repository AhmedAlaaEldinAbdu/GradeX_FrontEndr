import type { Pagination } from '@/types/Pagination';
import type { ApiResponse } from '../config';

export interface AcademicSubSystemListValue extends Pagination {
    academicSubSystemDto: AcademicSubSystemItem[];
}

export interface AcademicSubSystemDetailsValue {
    id: string;
    nameAr: string;
    nameEn: string;
}

export interface AcademicSubSystemItem {
    id: string;
    nameAr: string;
    nameEn: string;
}

export interface AcademicSubSystemParams {
    pageIndex: number;
    pageSize: number;
    name?: string;
    nameAr?: string;
    nameEn?: string;
}

export interface CreateAcademicSubSystem {
    nameAr: string;
    nameEn: string;
}

export interface UpdateAcademicSubSystemRequest extends CreateAcademicSubSystem {
    id: string;
}

export type AcademicSubSystemListResponse = ApiResponse<AcademicSubSystemListValue>;
export type AcademicSubSystemDetailsResponse = ApiResponse<AcademicSubSystemDetailsValue>;
