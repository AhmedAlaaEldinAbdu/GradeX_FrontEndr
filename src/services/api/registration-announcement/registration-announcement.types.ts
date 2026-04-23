export interface RegistrationAdvertisementDto {
  id: string;
  lkSchoolStageId: string;
  stageNameAr: string;
  stageNameEn: string;
  startDate: string;
  endDate: string;
  status: number;
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
  lkSchoolStageId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateRegistrationAdvertisementRequest
  extends CreateRegistrationAdvertisementRequest {
  id: string;
}
