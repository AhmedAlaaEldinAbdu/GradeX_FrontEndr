import { axiosClient } from '@/lib/http';
import type {
  GetRegistrationAdvertisementsResponse,
  CreateRegistrationAdvertisementRequest,
  UpdateRegistrationAdvertisementRequest,
  RegistrationAdvertisementDto,
} from './registration-announcement.types';

export const registrationAnnouncementApi = {
  getAll: async (pageIndex: number = 1, pageSize: number = 10) => {
    const response = await axiosClient.get<GetRegistrationAdvertisementsResponse>(
      '/RegistrationAdvertisement',
      {
        params: {
          pageIndex,
          pageSize,
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
};
