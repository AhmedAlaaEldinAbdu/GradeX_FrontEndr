/**
 * Applications Job Advertisement API Service
 * Handles HTTP requests for job application endpoints.
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { ApplicationsJobAdvertisementEndpoints } from '../endpoints/applications-job-advertisement-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  ApplicationsJobAdvertisementListData,
  ApplicationsJobAdvertisementListResponse,
  ApplicationsJobAdvertisementQueryParams,
  CreateApplicationsJobAdvertisementRequest,
  UpdateApplicationStatusRequest,
} from '@/services/api/types/applications-job-advertisement.types';

const serializeApplicationsJobAdvertisementParams = (
  params?: ApplicationsJobAdvertisementQueryParams
) => {
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

const appendValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  formData.append(key, String(value));
};

const primitiveApplicationFields: Array<{
  key: keyof CreateApplicationsJobAdvertisementRequest;
  formKey: string;
}> = [
    { key: 'jobAdvertisementId', formKey: 'JobAdvertisementId' },
    { key: 'teacherId', formKey: 'TeacherId' },
    { key: 'workShedule', formKey: 'WorkShedule' },
    { key: 'lkSchoolStageId', formKey: 'LKSchoolStageId' },
    { key: 'useProfileResume', formKey: 'UseProfileResume' },
    { key: 'worksInAnotherSchool', formKey: 'WorksInAnotherSchool' },
    { key: 'transferDuration', formKey: 'TransferDuration' },
    { key: 'experienceYears', formKey: 'ExperienceYears' },
    { key: 'meetingLink', formKey: 'MeetingLink' },
  ];

const buildApplicationsJobAdvertisementFormData = (
  data: CreateApplicationsJobAdvertisementRequest
): FormData => {
  const formData = new FormData();

  primitiveApplicationFields.forEach(({ key, formKey }) => {
    appendValue(formData, formKey, data[key]);
  });

  if (data.resumeFile) {
    formData.append('ResumeFile', data.resumeFile);
  }

  return formData;
};

type ApplicationsJobAdvertisementApiPayload =
  | ApplicationsJobAdvertisementListResponse
  | ApplicationsJobAdvertisementListData;

const isWrappedApplicationsResponse = (
  payload: ApplicationsJobAdvertisementApiPayload | undefined
): payload is ApplicationsJobAdvertisementListResponse => {
  return !!payload && typeof payload === 'object' && 'data' in payload && !!payload.data;
};

export async function getApplicationsJobAdvertisements(
  params?: ApplicationsJobAdvertisementQueryParams
): Promise<ApplicationsJobAdvertisementListResponse> {
  const response: AxiosResponse<ApplicationsJobAdvertisementApiPayload> = await axiosClient.get(
    ApplicationsJobAdvertisementEndpoints.getApplicationsJobAdvertisements,
    {
      params,
      paramsSerializer: { serialize: serializeApplicationsJobAdvertisementParams },
    }
  );

  const payload = response?.data;
  const normalizedResponse = isWrappedApplicationsResponse(payload)
    ? payload
    : payload
    ? {
        data: payload,
        isSuccess: true,
        message: '',
        validationErrors: null,
      }
    : null;

  if (!normalizedResponse?.data?.applicationsJobAdvertisementDtos) {
    return {
      data: {
        applicationsJobAdvertisementDtos: [],
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
        totalItems: 0,
        totalPages: 0,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return normalizedResponse;
}

export async function createApplicationsJobAdvertisement(
  data: CreateApplicationsJobAdvertisementRequest
): Promise<ApiResponseModel<null>> {
  const formData = buildApplicationsJobAdvertisementFormData(data);
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    ApplicationsJobAdvertisementEndpoints.addApplicationsJobAdvertisement,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function editApplicationsJobAdvertisementStatus(
  payload: UpdateApplicationStatusRequest
): Promise<ApiResponseModel<null>> {
  const body = {
    ApplicationsJobAdvertisementId: payload.id,
    ApplicationStatus: payload.applicationStatus,
    MeetingLink: payload.meetingLink ?? '',
  };

  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    ApplicationsJobAdvertisementEndpoints.editApplicationStatus,
    body
  );

  return response.data;
}

export const applicationsJobAdvertisementApiService = {
  getApplicationsJobAdvertisements,
  createApplicationsJobAdvertisement,
  editApplicationsJobAdvertisementStatus,
};

export default applicationsJobAdvertisementApiService;
