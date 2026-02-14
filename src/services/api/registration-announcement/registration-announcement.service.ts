import { axiosClient } from '@/lib/http';
import type {
  GetRegistrationAdvertisementsResponse,
  CreateRegistrationAdvertisementRequest,
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
};
