import { axiosClient } from '@/lib/http';
import type {
  GetRegistrationAnnouncementsResponse,
  GetRegistrationAnnouncementByIdResponse,
  CreateRegistrationAnnouncementRequest,
  UpdateRegistrationAnnouncementRequest,
  RegistrationAnnouncementQueryParams,
  RegistrationAnnouncementMutationResponse,
} from './registration-announcement.types';

export const registrationAnnouncementApi = {
  getAll: async ({
    pageIndex = 1,
    pageSize = 10,
    gradeName,
    status,
    startDate,
    endDate,
    schoolBranchId,
  }: RegistrationAnnouncementQueryParams = {}) => {
    const response = await axiosClient.get<GetRegistrationAnnouncementsResponse>(
      '/RegistrationAnouncement',
      {
        params: {
          PageIndex: pageIndex,
          PageSize: pageSize,
          GradeName: gradeName || undefined,
          Status: status || undefined,
          StartDate: startDate || undefined,
          EndDate: endDate || undefined,
          SchoolBranchId: schoolBranchId || undefined,
        },
      }
    );
    return response.data;
  },

  create: async (data: CreateRegistrationAnnouncementRequest) => {
    const response = await axiosClient.post<RegistrationAnnouncementMutationResponse>(
      '/RegistrationAnouncement',
      data
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosClient.get<GetRegistrationAnnouncementByIdResponse>(
      `/RegistrationAnouncement/${id}`
    );
    return response.data;
  },

  update: async (data: UpdateRegistrationAnnouncementRequest) => {
    const response = await axiosClient.put<RegistrationAnnouncementMutationResponse>(
      `/RegistrationAnouncement`,
      {
        id: data.id,
        gradeIds: data.gradeIds,
        startDate: data.startDate,
        endDate: data.endDate,
        schoolBranchId: data.schoolBranchId,
        registrationAnouncementStatus: data.registrationAnouncementStatus,
      }
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete(`/RegistrationAnouncement`, {
      params: { Id: id },
    });
    return response.data;
  },
};
