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

export interface CreateRegistrationAdvertisementRequest {
  lkSchoolStageId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateRegistrationAdvertisementRequest
  extends CreateRegistrationAdvertisementRequest {
  id: string;
}
