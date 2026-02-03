import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { OfferEndpoints } from '../endpoints/offer-endpoints';
import type { ApiResponseModel } from '../config';
import type {
    OfferDto,
    OfferListResponse,
    OfferQueryParams,
    CreateOfferRequest,
    UpdateOfferRequest,
} from '../types/offer.types';

const serializeParams = (params?: OfferQueryParams) => {
    const searchParams = new URLSearchParams();

    if (!params) {
        return searchParams.toString();
    }

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }

        searchParams.append(key, String(value));
    });

    return searchParams.toString();
};

export async function getOffers(params?: OfferQueryParams): Promise<OfferListResponse> {
    const response: AxiosResponse<OfferListResponse> = await axiosClient.get(OfferEndpoints.base, {
        params,
        paramsSerializer: { serialize: serializeParams },
    });

    return response.data;
}

export async function getOfferById(id: string): Promise<OfferDto> {
    const response: AxiosResponse<ApiResponseModel<OfferDto>> = await axiosClient.get(
        OfferEndpoints.getById(id)
    );

    return (response.data.data ?? response.data.value) as OfferDto;
}

export async function createOffer(data: CreateOfferRequest): Promise<ApiResponseModel<null>> {
    const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
        OfferEndpoints.create,
        data
    );

    return response.data;
}

export async function updateOffer(data: UpdateOfferRequest): Promise<ApiResponseModel<null>> {
    const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
        OfferEndpoints.update,
        data
    );

    return response.data;
}

export async function deleteOffer(id: string): Promise<ApiResponseModel<string>> {
    const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
        OfferEndpoints.delete(id)
    );

    return response.data;
}

export const offerApiService = {
    getOffers,
    getOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
};

export default offerApiService;
