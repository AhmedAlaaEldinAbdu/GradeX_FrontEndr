export interface LkSchoolStageItem {
  lkSchoolStageId: string;
  stageNameAr: string;
  stageNameEn: string;
}

export interface RegistrationAdvertisementDto {
  id: string;
  startDate: string;
  endDate: string;
  schoolBranchesId: string;
  status: number;
  lkSchoolStages: LkSchoolStageItem[];
}

export interface GetRegistrationAdvertisementsResponse {
  data: {
    registrationAdvertisementDto: RegistrationAdvertisementDto[];
    pageIndex: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
  isSuccess: boolean;
  message: string;
  validationErrors: null;
}

export interface RegistrationAdvertisementQueryParams {
  pageIndex?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  SchoolBranchesId?: string;
}

export interface CreateRegistrationAdvertisementRequest {
  lkSchoolStageIds: string[];
  startDate: string;
  endDate: string;
  schoolBranchesId?: string;
}

export interface UpdateRegistrationAdvertisementRequest
  extends CreateRegistrationAdvertisementRequest {
  id: string;
}
