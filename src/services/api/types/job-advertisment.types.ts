/**
 * Job Advertisment Types
 * Provides strongly typed contracts for job advertisment endpoints.
 */

export const JobAdvertismentWorkShedule = {
  ONLINE: 1,
  OFFLINE: 2,
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
  technicalAppName: string;
}

export interface JobAdvertismentPersonalSkillDto {
  personalSkillName: string;
}

export interface JobAdvertismentMaterialDto {
  materialId: string;
}

export interface JobAdvertismentCountryDto {
  lkCountryId: string;
}

export interface JobAdvertismentQualificationDto {
  lkQualificationId: string;
}

export interface JobAdvertismentSchoolStageDto {
  lkSchoolStageId: string;
}

export interface JobAdvertismentLanguageDto {
  lkLanguageId: string;
  lkLanguageLevelId: string;
}

export interface JobAdvertismentJobBenefitDto {
  lkJobBenefitId: string;
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
