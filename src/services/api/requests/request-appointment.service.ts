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
  const requestParams: RequestAppointmentsQueryParams = {
    PageIndex: params?.PageIndex ?? 1,
    PageSize: params?.PageSize ?? 10,
  };

  if (params?.StudentName) requestParams.StudentName = params.StudentName;
  if (params?.Date) requestParams.Date = params.Date;

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

export async function markRequestAppointmentAsViewed(id: string): Promise<void> {
  await axiosClient.put(RequestAppointmentEndpoints.markAsViewed(id));
}

export const requestAppointmentApiService = {
  getRequestAppointments,
  markRequestAppointmentAsViewed,
};

export default requestAppointmentApiService;
