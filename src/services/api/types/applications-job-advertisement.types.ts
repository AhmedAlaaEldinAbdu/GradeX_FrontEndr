import type { ApiResponseModel } from '../config';

export interface ApplicationsJobAdvertisementQualificationDto {
  id?: string;
  lkQualificationId: string;
  lkQualificationNameAr?: string;
  lkQualificationNameEn?: string;
}

export interface ApplicationsJobAdvertisement {
  id: string;
  jobAdvertisementId: string;
  teacherId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  lkCountryId: string | null;
  lKCountryNameAr?: string;
  lKCountryNameEn?: string;
  regionId?: string | null;
  regionNameAr?: string;
  regionNameEn?: string;
  cityId?: string | null;
  cityNameAr?: string;
  cityNameEn?: string;
  districtName?: string;
  streetName?: string;
  buildingNumber?: string;
  nationalityId?: string;
  nationalityNameAr?: string;
  nationalityNameEn?: string;
  workShedule: number;
  lkSchoolStageId: string;
  lkSchoolStageNameAr?: string;
  lkSchoolStageNameEn?: string;
  useProfileResume: boolean;
  resumeFile?: string | null;
  worksInAnotherSchool: boolean;
  transferDuration?: number;
  applicationStatus: number;
  experienceYears?: number;
  meetingLink?: string;
  lKQualificationDtos?: ApplicationsJobAdvertisementQualificationDto[];
  /** @deprecated Prefer lKQualificationDtos for API responses */
  lkQualificationDtos?: ApplicationsJobAdvertisementQualificationDto[];
}

export interface ApplicationsJobAdvertisementListData {
  applicationsJobAdvertisementDtos: ApplicationsJobAdvertisement[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface ApplicationsJobAdvertisementListResponse {
  data: ApplicationsJobAdvertisementListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | ApiResponseModel<ApplicationsJobAdvertisementListData>['validationErrors'];
}

export interface ApplicationsJobAdvertisementQueryParams {
  JobAdvertisementId?: string;
  PageIndex?: number;
  PageSize?: number;
  ApplicationStatus?: number;
  Search?: string;
  WorkShedule?: number;
  NationalityId?: string;
  LKQualificationId?: string;
  ExperienceYears?: number;
}

export interface CreateApplicationsJobAdvertisementRequest {
  jobAdvertisementId: string;
  teacherId: string;
  workShedule: number;
  lkSchoolStageId: string;
  useProfileResume: boolean;
  resumeFile?: File | Blob | null;
  worksInAnotherSchool: boolean;
  transferDuration: number;
  experienceYears: number;
  meetingLink?: string;
}

export interface UpdateApplicationStatusRequest {
  id: string;
  applicationStatus: number;
  meetingLink?: string;
}
