import { axiosClient } from '@/lib/http';
import type { ApiResponseModel } from '../config';
import { RequestAppointmentEndpoints } from '../endpoints/request-appointment-endpoints';
import type {
  RequestAppointmentsData,
  RequestAppointmentsListResponse,
  RequestAppointmentsQueryParams,
} from './requests.types';

export async function getRequestAppointments(
  params?: RequestAppointmentsQueryParams
): Promise<RequestAppointmentsListResponse> {
  const requestParams: Required<RequestAppointmentsQueryParams> = {
    PageIndex: params?.PageIndex ?? 1,
    PageSize: params?.PageSize ?? 10,
  };

  const response = await axiosClient.get<ApiResponseModel<RequestAppointmentsData>>(
    RequestAppointmentEndpoints.getAll,
    { params: requestParams }
  );

  const data = response.data.data ?? response.data.value;

  return {
    appointments: data?.requestAppointmentDto ?? [],
    pageIndex: data?.pageIndex ?? requestParams.PageIndex,
    totalPages: data?.totalPages ?? 0,
    totalItems: data?.totalItems ?? data?.requestAppointmentDto?.length ?? 0,
    pageSize: data?.pageSize ?? requestParams.PageSize,
  };
}

export const requestAppointmentApiService = {
  getRequestAppointments,
};

export default requestAppointmentApiService;
