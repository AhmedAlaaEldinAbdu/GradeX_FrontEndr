export interface SchoolStage {
  id: string;
  gradeId?: string;
  nameAr: string;
  nameEn: string;
  lkSchoolStageId?: string;
  academicSubSystemId?: string;
  isActive?: boolean;
}

export interface SubjectStage {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface SubjectAcademicSubSystem {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface SubjectTeacher {
  id: string;
  name?: string;
  fullName?: string;
}

export interface Subject {
  id: string;
  name: string;
  nameEn: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  schoolBranchesId: string | null;
  materialLevel: number;
  code?: string | null;
  iconName?: string | null;
  isSeed?: boolean;
  category?: string | null;
  teachers?: SubjectTeacher[];
  stages?: SubjectStage[];
  academicSubSystems?: SubjectAcademicSubSystem[];
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
  AcademicSubSystemId?: string;
  LKSchoolStageId?: string;
  GradeId?: string;
  LKMaterialCategoryId?: string;
}

export interface SettingsLookup {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface SubjectSettingsCategory extends SettingsLookup {
  code: string | null;
}

export interface SubjectSettingsItem {
  materialGradeId: string;
  materialId: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  code: string | null;
  iconName: string | null;
  category: SubjectSettingsCategory | null;
  academicSubSystem: SettingsLookup | null;
  stage: SettingsLookup | null;
  grade: SettingsLookup | null;
  teachersCount: number;
  isActive: boolean;
}

export interface SubjectSettingsStatistics {
  totalMaterials: number;
  totalTeachers: number;
}

export interface SubjectSettingsListData {
  items: SubjectSettingsItem[];
  statistics: SubjectSettingsStatistics;
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface SubjectSettingsResponse {
  data: SubjectSettingsListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface GradeAvailabilityRequest {
  schoolBranchId: string;
  materialId: string;
  gradeId: string;
  isActive: boolean;
}

export interface SubjectSettingsQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SchoolBranchId?: string;
  SearchName?: string;
  AcademicSubSystemId?: string;
  LKSchoolStageId?: string;
  GradeId?: string;
  MaterialId?: string;
  IsActive?: boolean;
}

export interface SubjectDto {
  name: string;
  nameEn?: string;
  materialLevel: number;
}

export interface CreateSubjectRequest {
  seedMaterialId?: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  schoolBranchesId?: string;
  materialLevel?: number;
  lkMaterialCategoryId?: string;
  iconName?: string;
  lkSchoolStageIds?: string[];
  gradeIds?: string[];
  teacherIds?: string[];
}

export interface UpdateSubjectRequest extends CreateSubjectRequest {
  id: string;
}

export const MaterialLevel = {
  EASY: 1,
  MEDIUM: 2,
  DIFFICULT: 3,
} as const;

export type MaterialLevelType = (typeof MaterialLevel)[keyof typeof MaterialLevel];
