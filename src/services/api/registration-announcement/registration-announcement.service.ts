import { axiosClient } from '@/lib/http';
import type {
  GetRegistrationAdvertisementsResponse,
  CreateRegistrationAdvertisementRequest,
  UpdateRegistrationAdvertisementRequest,
  RegistrationAdvertisementQueryParams,
} from './registration-announcement.types';

export const registrationAnnouncementApi = {
  getAll: async ({
    pageIndex = 1,
    pageSize = 10,
    searchTerm,
    status,
    startDate,
    endDate,
    SchoolBranchesId,
  }: RegistrationAdvertisementQueryParams = {}) => {
    const response = await axiosClient.get<GetRegistrationAdvertisementsResponse>(
      '/RegistrationAdvertisement',
      {
        params: {
          pageIndex,
          pageSize,
          SearchTerm: searchTerm || undefined,
          Status: status || undefined,
          StartDate: startDate || undefined,
          EndDate: endDate || undefined,
          SchoolBranchesId: SchoolBranchesId || undefined,
        },
      }
    );
    return response.data;
  },

  create: async (data: CreateRegistrationAdvertisementRequest) => {
    const response = await axiosClient.post('/RegistrationAdvertisement', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosClient.get<GetRegistrationAdvertisementsResponse>(
      `/RegistrationAdvertisement`,
      {
        params: { Id: id },
      }
    );
    return response.data;
  },

  update: async (data: UpdateRegistrationAdvertisementRequest) => {
    const response = await axiosClient.put(
      `/RegistrationAdvertisement`,
      {
        lkSchoolStageId: data.lkSchoolStageId,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      {
        params: { Id: data.id },
      }
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete(`/RegistrationAdvertisement/${id}`);
    return response.data;
  },
};
