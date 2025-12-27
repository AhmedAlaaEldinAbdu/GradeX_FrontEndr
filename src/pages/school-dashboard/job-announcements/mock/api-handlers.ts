/**
 * Mock API Handlers
 * Simulates backend API responses for job announcements.
 */
import type {
  JobAdvertisment,
  JobAdvertismentListResponse,
  JobAdvertismentQueryParams,
  CreateJobAdvertismentRequest,
} from '@/services/api/types/job-advertisment.types';
import type { ApiResponseModel } from '@/services/api/config';
import {
  getMockJobAnnouncements,
  addMockJobAnnouncement,
  removeMockJobAnnouncement,
} from './job-announcements-data';

/**
 * Simulates fetching job announcements with pagination and filtering.
 */
export const getMockJobAdvertisments = (
  params?: JobAdvertismentQueryParams
): JobAdvertismentListResponse => {
  const allJobs = getMockJobAnnouncements();

  // Apply filters
  let filteredJobs = [...allJobs];

  if (params?.SearchName) {
    const searchLower = params.SearchName.toLowerCase();
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.name?.toLowerCase().includes(searchLower) ||
        job.nameEn?.toLowerCase().includes(searchLower) ||
        job.lkTeacherLevelNameAr?.toLowerCase().includes(searchLower) ||
        job.lkTeacherLevelNameEn?.toLowerCase().includes(searchLower)
    );
  }

  if (params?.LKCountryId) {
    filteredJobs = filteredJobs.filter((job) =>
      job.jobAdvertisementCountryDto?.some((country) => country.lkCountryId === params.LKCountryId)
    );
  }

  if (params?.LKSchoolStageId) {
    filteredJobs = filteredJobs.filter((job) =>
      job.jobAdvertisementSchoolStageDto?.some(
        (stage) => stage.lkSchoolStageId === params.LKSchoolStageId
      )
    );
  }

  if (params?.MaterialId) {
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.materialId === params.MaterialId ||
        job.jobAdvertismentMaterialDto?.some(
          (material) => material.materialId === params.MaterialId
        )
    );
  }

  if (params?.WorkShedule !== undefined) {
    filteredJobs = filteredJobs.filter((job) => job.workShedule === params.WorkShedule);
  }

  // Pagination
  const pageIndex = params?.PageIndex || 1;
  const pageSize = params?.PageSize || 10;
  const startIndex = (pageIndex - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  return {
    data: {
      jobAdvertismentDto: paginatedJobs,
      totalItems: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / pageSize),
      pageIndex,
      pageSize,
    },
    isSuccess: true,
    message: 'Mock data retrieved successfully',
    validationErrors: null,
  };
};

/**
 * Simulates fetching a single job announcement by ID.
 */
export const getMockJobAdvertismentById = (id: string): JobAdvertisment | null => {
  const allJobs = getMockJobAnnouncements();
  return allJobs.find((job) => job.id === id) || null;
};

/**
 * Simulates creating a new job announcement.
 */
export const createMockJobAdvertisment = (
  data: CreateJobAdvertismentRequest
): ApiResponseModel<null> => {
  const newJob: JobAdvertisment = {
    ...data,
    id: `job-mock-${Date.now()}`,
    name: data.jobDescription?.split(' ').slice(0, 3).join(' ') || 'New Job',
    nameEn: data.jobDescriptionEn?.split(' ').slice(0, 3).join(' ') || 'New Job',
    applicantsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  addMockJobAnnouncement(newJob);

  return {
    value: null,
    data: null,
    status: 200,
    isSuccess: true,
    successMessage: 'Job announcement created successfully',
    correlationId: `mock-${Date.now()}`,
    location: '',
    errors: [],
    validationErrors: null,
  };
};

/**
 * Simulates updating a job announcement.
 */
export const updateMockJobAdvertisment = (
  id: string,
  _data: Partial<JobAdvertisment>
): ApiResponseModel<null> => {
  const job = getMockJobAdvertismentById(id);

  if (!job) {
    return {
      value: null,
      data: null,
      status: 404,
      isSuccess: false,
      successMessage: '',
      correlationId: `mock-${Date.now()}`,
      location: '',
      errors: ['Job announcement not found'],
      validationErrors: null,
    };
  }

  return {
    value: null,
    data: null,
    status: 200,
    isSuccess: true,
    successMessage: 'Job announcement updated successfully',
    correlationId: `mock-${Date.now()}`,
    location: '',
    errors: [],
    validationErrors: null,
  };
};

/**
 * Simulates deleting a job announcement.
 */
export const deleteMockJobAdvertisment = (id: string): { success: boolean; message: string } => {
  const job = getMockJobAdvertismentById(id);

  if (!job) {
    return {
      success: false,
      message: 'Job announcement not found',
    };
  }

  removeMockJobAnnouncement(id);

  return {
    success: true,
    message: 'Job announcement deleted successfully',
  };
};

/**
 * Helper to simulate API delay
 */
export const simulateApiDelay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
