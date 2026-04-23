export interface SchoolStage {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface Subject {
  id: string;
  name: string;
  nameEn: string | null;
  schoolBranchesId: string | null;
  materialLevel: number;
  schoolGrades: SchoolStage[];
}

export interface SubjectListData {
  materialDto: Subject[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface SubjectListResponse {
  data: SubjectListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface SubjectQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SearchName?: string;
  Level?: number;
  SchoolBranchId?: string;
  GradeId?: string;
}

export interface SubjectDto {
  name: string;
  nameEn?: string;
  materialLevel: number;
}

export interface CreateSubjectRequest {
  name: string;
  nameEn?: string;
  materialLevel: number;
  gradeIds?: string[];
  schoolBranchesId?: string;
}

export interface UpdateSubjectRequest {
  id: string;
  name: string;
  nameEn?: string;
  materialLevel: number;
  gradeIds?: string[];
  schoolBranchesId?: string;
}

export const MaterialLevel = {
  EASY: 1,
  MEDIUM: 2,
  DIFFICULT: 3,
} as const;

export type MaterialLevelType = (typeof MaterialLevel)[keyof typeof MaterialLevel];
