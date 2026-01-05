/**
 * Job Advertisment Types
 * Provides strongly typed contracts for job advertisment endpoints.
 */

export const JobAdvertismentWorkShedule = {
  FULL_TIME: 1,
  PART_TIME: 2,
  BOTH: 3,
} as const;

export const JobType = {
  FULLTIME: 1,
  PARTTIME: 2,
} as const;

export type JobAdvertismentWorkShedule =
  (typeof JobAdvertismentWorkShedule)[keyof typeof JobAdvertismentWorkShedule];
  
export type JobType =
  (typeof JobType)[keyof typeof JobType];

export interface JobAdvertismentTechnicalSkillDto {
  id?: string;
  technicalAppId?: string;
  technicalAppName: string;
}

export interface JobAdvertismentPersonalSkillDto {
  id?: string;
  personalSkillId?: string;
  personalSkillName: string;
}

export interface JobAdvertismentMaterialDto {
  id?: string;
  materialId: string;
  materialNameAr?: string;
  materialNameEn?: string;
}

export interface JobAdvertismentCountryDto {
  id?: string;
  lkCountryId: string;
  lkCountryNameAr?: string;
  lkCountryNameEn?: string;
}

export interface JobAdvertismentQualificationDto {
  id?: string;
  lkQualificationId: string;
  lkQualificationNameAr?: string;
  lkQualificationNameEn?: string;
}

export interface JobAdvertismentSchoolStageDto {
  id?: string;
  lkSchoolStageId: string;
  lkSchoolStageNameAr?: string;
  lkSchoolStageNameEn?: string;
}

export interface JobAdvertismentLanguageDto {
  id?: string;
  lkLanguageId: string;
  lkLanguageNameAr?: string;
  lkLanguageNameEn?: string;
  lkLanguageLevelId: string;
  lkLanguageLevelNameAr?: string;
  lkLanguageLevelNameEn?: string;
}

export interface JobAdvertismentJobBenefitDto {
  id?: string;
  lkJobBenefitId: string;
  lkJobBenefitNameAr?: string;
  lkJobBenefitNameEn?: string;
}

export interface JobAdvertismentBase {
  name: string;
  nameEn: string;
  schoolBranchId: string;
  qualificationType: number;
  materialId: string;
  jobDescription: string;
  jobDescriptionEn: string;
  jobResponsibilities: string;
  jobResponsibilitiesEn: string;
  noticePeriod: number;
  noticePeriodDate: string;
  advertisementStartDate: string;
  advertisementEndDate: string;
  nationality: number;
  salary: number;
  minimumSalary: number;
  maximumSalary: number;
  teacherGender: number;
  yearsExperience: number;
  workShedule: JobAdvertismentWorkShedule;
  workStartTime: string;
  workEndTime: string;
  lkAdministrativePositionId: string;
  lkTeacherLevelId: string;
  jobAdvertismentTechnicalSkillsDto?: JobAdvertismentTechnicalSkillDto[];
  jobAdvertismentPersonalSkillsDto?: JobAdvertismentPersonalSkillDto[];
  jobAdvertismentMaterialDto?: JobAdvertismentMaterialDto[];
  jobAdvertisementCountryDto?: JobAdvertismentCountryDto[];
  jobAdvertisementQualificationDto?: JobAdvertismentQualificationDto[];
  jobAdvertisementSchoolStageDto?: JobAdvertismentSchoolStageDto[];
  jobAdvertisementLanguageDto?: JobAdvertismentLanguageDto[];
  jobAdvertisementJobBenefitDto?: JobAdvertismentJobBenefitDto[];
}

export interface JobAdvertisment extends JobAdvertismentBase {
  id: string;
  status?: number | string;
  createdAt?: string;
  updatedAt?: string;
  schoolNameAr?: string;
  schoolNameEn?: string;
  applicantsCount?: number;
  materialNameAr?: string;
  materialNameEn?: string;
  lkAdministrativePositionNameAr?: string;
  lkAdministrativePositionNameEn?: string;
  lkTeacherLevelNameAr?: string;
  lkTeacherLevelNameEn?: string;
}

export interface JobAdvertismentListData {
  jobAdvertismentDto: JobAdvertisment[];
  totalItems: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface JobAdvertismentListResponse {
  data: JobAdvertismentListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface JobAdvertismentQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SearchName?: string;
  SchoolBranchId?: string;
  LKCountryId?: string;
  LKSchoolStageId?: string;
  MaterialId?: string;
  WorkShedule?: JobAdvertismentWorkShedule;
}

export interface CreateJobAdvertismentRequest extends JobAdvertismentBase {}

export interface UpdateJobAdvertismentRequest extends JobAdvertismentBase {}
