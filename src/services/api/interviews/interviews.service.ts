/**
 * Interview API Service
 * Provides typed wrappers around interview endpoints using Swagger contract.
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { InterviewEndpoints } from '../endpoints/interview-endpoints';
import type { ApiResponseModel } from '../config';
import type {
    InterviewListResponse,
    InterviewQueryParams,
    Interview,
    CreateInterviewRequest,
    UpdateInterviewRequest,
} from '@/services/api/types/interviews.types';

const serializeParams = (params?: InterviewQueryParams) => {
    const searchParams = new URLSearchParams();

    if (!params) {
        return searchParams.toString();
    }

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
        } else {
            searchParams.append(key, String(value));
        }
    });

    return searchParams.toString();
};

export async function getInterviews(
    params?: InterviewQueryParams
): Promise<InterviewListResponse> {
    const response: AxiosResponse<InterviewListResponse> = await axiosClient.get(
        InterviewEndpoints.getInterviews,
        {
            params,
            paramsSerializer: { serialize: serializeParams },
        }
    );

    if (!response?.data?.data) {
        return {
            data: {
                interviewDto: [],
                totalItems: 0,
                totalPages: 0,
                pageIndex: params?.PageIndex || 1,
                pageSize: params?.PageSize || 10,
            },
            isSuccess: false,
            message: '',
            validationErrors: null,
        };
    }

    return response.data;
}

export async function getInterviewById(id: string): Promise<Interview> {
    const response: AxiosResponse<ApiResponseModel<Interview>> = await axiosClient.get(
        InterviewEndpoints.getInterviewById(id)
    );

    if (response.data.data) {
        return response.data.data;
    }

    return response.data.value as Interview;
}

export async function createInterview(data: CreateInterviewRequest | FormData): Promise<ApiResponseModel<null>> {
    const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
        InterviewEndpoints.addInterview,
        data,
        {
            headers:
                data instanceof FormData
                    ? {
                        'Content-Type': 'multipart/form-data',
                    }
                    : undefined,
        }
    );

    return response.data;
}

export async function updateInterview(
    id: string,
    data: UpdateInterviewRequest | FormData
): Promise<ApiResponseModel<null>> {
    const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
        InterviewEndpoints.editInterview,
        data,
        {
            params: { Id: id },
            headers:
                data instanceof FormData
                    ? {
                        'Content-Type': 'multipart/form-data',
                    }
                    : undefined,
        }
    );

    return response.data;
}

export async function deleteInterview(id: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
        InterviewEndpoints.deleteInterview(id)
    );

    return {
        success: response.data.isSuccess,
        message: response.data.value || 'Interview deleted successfully',
    };
}

export const interviewApiService = {
    getInterviews,
    getInterviewById,
    createInterview,
    updateInterview,
    deleteInterview,
};

export default interviewApiService;