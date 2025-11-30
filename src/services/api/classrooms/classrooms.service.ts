/**
 * Classroom API Service
 * Handles all API calls related to classroom management using Axios
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { ClassroomEndpoints } from '../endpoints/classroom-endpoints';
import type { ApiResponseModel } from '../config';
import type {
    Classroom,
    ClassroomListResponse,
    ClassroomQueryParams,
    CreateClassroomRequest,
    UpdateClassroomRequest,
} from '@/types/classrooms';

// ============================================================================
// Classroom CRUD Operations
// ============================================================================

/**
 * Get list of classrooms with pagination and filters
 */
export async function getClassrooms(params?: ClassroomQueryParams): Promise<ClassroomListResponse> {
    const response: AxiosResponse<ClassroomListResponse> = await axiosClient.get(
        ClassroomEndpoints.getClassrooms,
        {
            params,
            paramsSerializer: {
                serialize: (params) => {
                    const searchParams = new URLSearchParams();

                    Object.entries(params).forEach(([key, value]) => {
                        if (value === undefined || value === null) return;

                        if (Array.isArray(value)) {
                            value.forEach((v) => searchParams.append(key, String(v)));
                        } else {
                            searchParams.append(key, String(value));
                        }
                    });

                    return searchParams.toString();
                },
            },
        }
    );

    if (!response?.data?.data) {
        return {
            data: {
                classroomDto: [],
                totalItems: 0,
                totalPages: 0,
                pageIndex: params?.pageIndex || 1,
                pageSize: params?.pageSize || 10,
            },
            isSuccess: false,
            message: '',
            validationErrors: null,
        };
    }

    return response.data;
}

/**
 * Get classroom by ID
 */
export async function getClassroomById(id: string): Promise<Classroom> {
    const response: AxiosResponse<ApiResponseModel<Classroom>> = await axiosClient.get(
        ClassroomEndpoints.getClassroomById(id)
    );

    return response.data.value;
}

/**
 * Create new classroom(s)
 */
export async function createClassroom(data: CreateClassroomRequest | FormData): Promise<Classroom[]> {
    const response: AxiosResponse<ApiResponseModel<Classroom[]>> = await axiosClient.post(
        ClassroomEndpoints.addClassroom,
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

    // Check if the response indicates validation errors
    if (
        !response.data.isSuccess &&
        response.data.validationErrors &&
        response.data.validationErrors.length > 0
    ) {
        // Create a custom error that includes validation errors
        const error = new Error('Validation failed') as Error & {
            validationErrors: typeof response.data.validationErrors;
            isValidationError: boolean;
        };
        error.validationErrors = response.data.validationErrors;
        error.isValidationError = true;
        throw error;
    }

    return response.data.value;
}

/**
 * Update an existing classroom
 */
export async function updateClassroom(id: string, data: UpdateClassroomRequest | FormData): Promise<Classroom> {
    const response: AxiosResponse<ApiResponseModel<Classroom>> = await axiosClient.put(
        ClassroomEndpoints.editClassroom,
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

    return response.data.value;
}

/**
 * Delete a classroom
 */
export async function deleteClassroom(id: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
        ClassroomEndpoints.deleteClassroom(id)
    );

    return {
        success: response.data.isSuccess,
        message: response.data.value || 'Classroom deleted successfully',
    };
}

// ============================================================================
// Export All Services
// ============================================================================

export const classroomApiService = {
    getClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom,
};

export default classroomApiService;
