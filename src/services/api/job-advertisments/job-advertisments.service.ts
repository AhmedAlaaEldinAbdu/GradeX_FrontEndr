/**
 * Job Advertisment API Service
 * Wraps axios calls for the JobAdvertisment controller.
 */

import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { JobAdvertismentEndpoints } from '../endpoints/job-advertisment-endpoints';
import type { ApiResponseModel } from '../config';
import type {
  JobAdvertismentListResponse,
  JobAdvertismentQueryParams,
  JobAdvertisment,
  CreateJobAdvertismentRequest,
  UpdateJobAdvertismentRequest,
  JobAdvertismentBase,
  JobAdvertismentTechnicalSkillDto,
  JobAdvertismentPersonalSkillDto,
  JobAdvertismentMaterialDto,
  JobAdvertismentCountryDto,
  JobAdvertismentQualificationDto,
  JobAdvertismentSchoolStageDto,
  JobAdvertismentLanguageDto,
  JobAdvertismentJobBenefitDto,
} from '@/services/api/types/job-advertisment.types';

const serializeJobAdvertismentParams = (params?: JobAdvertismentQueryParams) => {
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

const appendIndexedCollection = <T extends object>(
  formData: FormData,
  formKey: string,
  items: T[] | undefined,
  allowedKeys: ReadonlyArray<keyof T>
) => {
  if (!items?.length) {
    return;
  }

  items.forEach((item, index) => {
    allowedKeys.forEach((key) => {
      const value = item[key];
      if (value !== undefined && value !== null && value !== '') {
        const fieldName = `${formKey}[${index}].${String(key)}`;
        formData.append(fieldName, String(value));
      }
    });
  });
};

const primitiveJobAdvertismentFields: Array<{
  key: keyof JobAdvertismentBase;
  formKey: string;
}> = [
  { key: 'name', formKey: 'Name' },
  { key: 'nameEn', formKey: 'NameEn' },
  { key: 'schoolBranchId', formKey: 'SchoolBranchId' },
  { key: 'qualificationType', formKey: 'QualificationType' },
  { key: 'materialId', formKey: 'MaterialId' },
  { key: 'jobDescription', formKey: 'JobDescription' },
  { key: 'jobDescriptionEn', formKey: 'JobDescriptionEn' },
  { key: 'jobResponsibilities', formKey: 'JobResponsibilities' },
  { key: 'jobResponsibilitiesEn', formKey: 'JobResponsibilitiesEn' },
  { key: 'noticePeriod', formKey: 'NoticePeriod' },
  { key: 'noticePeriodDate', formKey: 'NoticePeriodDate' },
  { key: 'advertisementStartDate', formKey: 'AdvertisementStartDate' },
  { key: 'advertisementEndDate', formKey: 'AdvertisementEndDate' },
  { key: 'nationality', formKey: 'Nationality' },
  { key: 'salary', formKey: 'Salary' },
  { key: 'minimumSalary', formKey: 'MinimumSalary' },
  { key: 'maximumSalary', formKey: 'MaximumSalary' },
  { key: 'teacherGender', formKey: 'TeacherGender' },
  { key: 'yearsExperience', formKey: 'YearsExperience' },
  { key: 'workShedule', formKey: 'WorkShedule' },
  { key: 'workStartTime', formKey: 'WorkStartTime' },
  { key: 'workEndTime', formKey: 'WorkEndTime' },
  { key: 'lkAdministrativePositionId', formKey: 'LKAdministrativePositionId' },
  { key: 'lkTeacherLevelId', formKey: 'LKTeacherLevelId' },
];

const buildJobAdvertismentFormData = (data: JobAdvertismentBase): FormData => {
  const formData = new FormData();

  primitiveJobAdvertismentFields.forEach(({ key, formKey }) => {
    appendValue(formData, formKey, data[key]);
  });

  appendIndexedCollection<JobAdvertismentTechnicalSkillDto>(
    formData,
    'JobAdvertismentTechnicalSkillsDto',
    data.jobAdvertismentTechnicalSkillsDto,
    ['technicalAppName']
  );

  appendIndexedCollection<JobAdvertismentPersonalSkillDto>(
    formData,
    'JobAdvertismentPersonalSkillsDto',
    data.jobAdvertismentPersonalSkillsDto,
    ['personalSkillName']
  );

  appendIndexedCollection<JobAdvertismentMaterialDto>(
    formData,
    'JobAdvertismentMaterialDto',
    data.jobAdvertismentMaterialDto,
    ['materialId']
  );

  appendIndexedCollection<JobAdvertismentCountryDto>(
    formData,
    'JobAdvertisementCountryDto',
    data.jobAdvertisementCountryDto,
    ['lkCountryId']
  );

  appendIndexedCollection<JobAdvertismentQualificationDto>(
    formData,
    'JobAdvertisementQualificationDto',
    data.jobAdvertisementQualificationDto,
    ['lkQualificationId']
  );

  appendIndexedCollection<JobAdvertismentSchoolStageDto>(
    formData,
    'JobAdvertisementSchoolStageDto',
    data.jobAdvertisementSchoolStageDto,
    ['lkSchoolStageId']
  );

  appendIndexedCollection<JobAdvertismentLanguageDto>(
    formData,
    'JobAdvertisementLanguageDto',
    data.jobAdvertisementLanguageDto,
    ['lkLanguageId', 'lkLanguageLevelId']
  );

  appendIndexedCollection<JobAdvertismentJobBenefitDto>(
    formData,
    'JobAdvertisementJobBenefitDto',
    data.jobAdvertisementJobBenefitDto,
    ['lkJobBenefitId']
  );

  return formData;
};

export async function getJobAdvertisments(
  params?: JobAdvertismentQueryParams
): Promise<JobAdvertismentListResponse> {
  const response: AxiosResponse<JobAdvertismentListResponse> = await axiosClient.get(
    JobAdvertismentEndpoints.getJobAdvertisments,
    {
      params,
      paramsSerializer: { serialize: serializeJobAdvertismentParams },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        jobAdvertismentDto: [],
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

export async function getJobAdvertismentById(id: string): Promise<JobAdvertisment> {
  const response: AxiosResponse<ApiResponseModel<JobAdvertisment>> = await axiosClient.get(
    JobAdvertismentEndpoints.getJobAdvertismentById(id)
  );

  if (response.data.data) {
    return response.data.data;
  }

  return response.data.value as JobAdvertisment;
}

export async function createJobAdvertisment(
  data: CreateJobAdvertismentRequest
): Promise<ApiResponseModel<null>> {
  const formData = buildJobAdvertismentFormData(data);
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    JobAdvertismentEndpoints.addJobAdvertisment,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function updateJobAdvertisment(
  id: string,
  data: UpdateJobAdvertismentRequest
): Promise<ApiResponseModel<null>> {
  const formData = buildJobAdvertismentFormData(data);
  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    JobAdvertismentEndpoints.editJobAdvertisment,
    formData,
    {
      params: { Id: id },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export async function deleteJobAdvertisment(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<ApiResponseModel<string>> = await axiosClient.delete(
    JobAdvertismentEndpoints.deleteJobAdvertisment(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.value || 'Job advertisment deleted successfully',
  };
}

export const jobAdvertismentApiService = {
  getJobAdvertisments,
  getJobAdvertismentById,
  createJobAdvertisment,
  updateJobAdvertisment,
  deleteJobAdvertisment,
};

export default jobAdvertismentApiService;
