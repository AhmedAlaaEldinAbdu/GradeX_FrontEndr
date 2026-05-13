import type { AxiosResponse } from 'axios';
import { axiosClient } from '@/lib/http';
import ContractsEndpoints from '../endpoints/contracts-endpoints';
import type {
  ContractsListResponse,
  ContractsQueryParams,
  CreateSchoolContractRequest,
  UpdateSchoolContractRequest,
  RequestSignContractPayload,
  ConfirmSignContractPayload,
  SchoolContractResponse,
  SignContractResponse,
} from '../types/contracts.types';

/**
 * Build the multipart/form-data body that the create/update endpoints expect.
 * Wire field names match the API schema verbatim (PascalCase + `ValueAddedtax`
 * spelling) — don't "fix" them on the client.
 */
const buildContractFormData = (
  data: CreateSchoolContractRequest | UpdateSchoolContractRequest
): FormData => {
  const fd = new FormData();

  if ('id' in data && data.id) fd.append('Id', data.id);
  fd.append('SchoolBranchId', data.schoolBranchId);
  fd.append('Description', String(data.description));
  fd.append('CommercialRegister', data.commercialRegister);
  fd.append('NationalAddress', data.nationalAddress);
  fd.append('RepresentativeName', data.representativeName);
  fd.append('RepresentativePosition', data.representativePosition);
  if (data.representativeDocument) {
    fd.append('RepresentativeDocument', data.representativeDocument);
  }
  fd.append('IdentityType', String(data.identityType));
  fd.append('MobileNumber', data.mobileNumber);
  fd.append('PhoneNumber', data.phoneNumber);
  fd.append('Email', data.email);
  fd.append('NationalityId', data.nationalityId);
  fd.append('AdministrativeFees', String(data.administrativeFees));
  fd.append('ValueAddedtax', String(data.valueAddedtax));

  // Withdrawal periods are an array of complex DTOs — serialize each field
  // with bracket notation so ASP.NET model-binding can rebuild the list.
  data.withdrawalPeriods.forEach((period, index) => {
    fd.append(`WithdrawalPeriods[${index}].Semester`, String(period.semester));
    fd.append(
      `WithdrawalPeriods[${index}].WithdrawalPeriodText`,
      period.withdrawalPeriodText ?? ''
    );
    fd.append(
      `WithdrawalPeriods[${index}].AdminFeeDiscountPercentage`,
      String(period.adminFeeDiscountPercentage)
    );
    fd.append(`WithdrawalPeriods[${index}].TotalFees`, String(period.totalFees));
    fd.append(`WithdrawalPeriods[${index}].WithdrawalTime`, String(period.withdrawalTime));
  });

  return fd;
};

export async function createSchoolContract(
  data: CreateSchoolContractRequest
): Promise<SchoolContractResponse> {
  const response: AxiosResponse<SchoolContractResponse> = await axiosClient.post(
    ContractsEndpoints.createSchoolContract,
    buildContractFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export async function updateSchoolContract(
  data: UpdateSchoolContractRequest
): Promise<SchoolContractResponse> {
  const response: AxiosResponse<SchoolContractResponse> = await axiosClient.put(
    ContractsEndpoints.updateSchoolContract,
    buildContractFormData(data),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

export async function getSchoolContractByStudentId(
  studentId: string
): Promise<SchoolContractResponse> {
  const response: AxiosResponse<SchoolContractResponse> = await axiosClient.get(
    ContractsEndpoints.getByStudent(studentId)
  );
  return response.data;
}

export async function requestSignContract(
  payload: RequestSignContractPayload
): Promise<SignContractResponse> {
  const response: AxiosResponse<SignContractResponse> = await axiosClient.post(
    ContractsEndpoints.requestSign,
    payload
  );
  return response.data;
}

export async function confirmSignContract(
  payload: ConfirmSignContractPayload
): Promise<SignContractResponse> {
  const response: AxiosResponse<SignContractResponse> = await axiosClient.post(
    ContractsEndpoints.confirmSign,
    payload
  );
  return response.data;
}

export async function getAllContractsBySchoolBranchId(
  params: ContractsQueryParams
): Promise<ContractsListResponse> {
  const response: AxiosResponse<ContractsListResponse> = await axiosClient.get(
    ContractsEndpoints.getAllBySchoolBranchId,
    { params }
  );
  return response.data;
}

export const contractsApiService = {
  createSchoolContract,
  updateSchoolContract,
  getSchoolContractByStudentId,
  requestSignContract,
  confirmSignContract,
  getAllContractsBySchoolBranchId,
};

export default contractsApiService;
