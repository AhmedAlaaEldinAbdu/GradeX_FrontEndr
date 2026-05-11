export interface RegistrationAnnouncementDto {
  id: string;
  startDate: string;
  endDate: string;
  schoolBranchId: string;
  registrationAnouncementStatus: number;
  gradeIds: string[];
}

export interface GetRegistrationAnnouncementsResponse {
  data: {
    registrationAnouncementDto: RegistrationAnnouncementDto[];
    pageIndex: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  isSuccess: boolean;
  message: string;
  validationErrors: null;
}

export interface GetRegistrationAnnouncementByIdResponse {
  data: RegistrationAnnouncementDto;
  isSuccess: boolean;
  message: string;
  validationErrors: null;
}

export interface RegistrationAnnouncementQueryParams {
  pageIndex?: number;
  pageSize?: number;
  gradeName?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  schoolBranchId?: string;
}

export interface CreateRegistrationAnnouncementRequest {
  gradeIds: string[];
  startDate: string;
  endDate: string;
  schoolBranchId?: string;
}

export interface UpdateRegistrationAnnouncementRequest
  extends CreateRegistrationAnnouncementRequest {
  id: string;
  registrationAnouncementStatus: number;
}
