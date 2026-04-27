import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { SchoolTaskEndpoints } from '../endpoints/school-task-endpoints';
import type {
  CreateSchoolTaskRequest,
  SchoolTask,
  SchoolTaskDetailResponse,
  SchoolTaskListResponse,
  SchoolTaskMutationResponse,
  SchoolTaskQueryParams,
  SchoolTaskStatusItem,
  SchoolTaskStatusListResponse,
  SchoolTaskStatusQueryParams,
  StudentSchoolTask,
  StudentSchoolTaskListResponse,
  StudentSchoolTaskQueryParams,
  UpdateSchoolTaskRequest,
} from '@/types/schoolTasks';

const serializeParams = (
  params?: SchoolTaskQueryParams | SchoolTaskStatusQueryParams | StudentSchoolTaskQueryParams
) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

function buildSchoolTaskFormData(
  data: CreateSchoolTaskRequest | UpdateSchoolTaskRequest
): FormData {
  const formData = new FormData();

  formData.append('SchoolBranchesId', data.schoolBranchesId);
  formData.append('GradeId', data.gradeId);
  formData.append('ClassroomId', data.classroomId);
  formData.append('MaterialId', data.materialId);
  formData.append('NameAr', data.nameAr);
  formData.append('NameEn', data.nameEn);
  formData.append('TaskType', String(data.taskType));
  formData.append('Date', data.date);
  formData.append('DeliveryDate', data.deliveryDate);
  formData.append('StartPageNumber', String(data.startPageNumber));
  formData.append('EndPageNumber', String(data.endPageNumber));
  formData.append('AssignmentType', String(data.assignmentType));

  if (data.descriptionAr) {
    formData.append('DescriptionAr', data.descriptionAr);
  }

  if (data.descriptionEn) {
    formData.append('DescriptionEn', data.descriptionEn);
  }

  if (data.attachment?.length) {
    data.attachment.forEach((file) => {
      formData.append('Attachment', file);
    });
  }

  if (data.studentIds?.length) {
    data.studentIds.forEach((studentId) => {
      formData.append('StudentIds', studentId);
    });
  }

  return formData;
}

const buildEmptySchoolTaskListResponse = (
  params?: SchoolTaskQueryParams
): SchoolTaskListResponse => ({
  data: {
    schoolTaskDto: [],
    totalItems: 0,
    totalPages: 0,
    pageIndex: params?.PageIndex || 1,
    pageSize: params?.PageSize || 10,
  },
  isSuccess: false,
  message: '',
  validationErrors: null,
});

const buildEmptyStatusListResponse = (
  params?: SchoolTaskStatusQueryParams
): SchoolTaskStatusListResponse => ({
  data: {
    taskStatuses: [],
    totalItems: 0,
    totalPages: 0,
    pageIndex: params?.PageIndex || 1,
    pageSize: params?.PageSize || 10,
  },
  isSuccess: false,
  message: '',
  validationErrors: null,
});

const buildEmptyStudentTaskListResponse = (
  params?: StudentSchoolTaskQueryParams
): StudentSchoolTaskListResponse => ({
  data: {
    schoolTasks: [],
    totalItems: 0,
    totalPages: 0,
    pageIndex: params?.PageIndex || 1,
    pageSize: params?.PageSize || 10,
  },
  isSuccess: false,
  message: '',
  validationErrors: null,
});

const mapStatusItems = (data?: Record<string, unknown>): SchoolTaskStatusItem[] => {
  if (!data) {
    return [];
  }

  const candidates = [
    data.getTaskStatusDto,
    data.taskStatuses,
    data.schoolTaskStatusDto,
    data.taskStatusDto,
    data.schoolTaskStatuses,
    data.items,
  ];

  const matched = candidates.find(Array.isArray);
  return Array.isArray(matched) ? (matched as SchoolTaskStatusItem[]) : [];
};

const mapStudentTaskItems = (data?: Record<string, unknown>): StudentSchoolTask[] => {
  if (!data) {
    return [];
  }

  const candidates = [data.schoolTasks, data.schoolTaskDto, data.studentTaskDto, data.items];
  const matched = candidates.find(Array.isArray);
  return Array.isArray(matched) ? (matched as StudentSchoolTask[]) : [];
};

export async function getSchoolTasks(
  params?: SchoolTaskQueryParams
): Promise<SchoolTaskListResponse> {
  const response: AxiosResponse<SchoolTaskListResponse> = await axiosClient.get(
    SchoolTaskEndpoints.getSchoolTasks,
    {
      params,
      paramsSerializer: { serialize: serializeParams },
    }
  );

  if (!response?.data?.data) {
    return buildEmptySchoolTaskListResponse(params);
  }

  return response.data;
}

export async function createSchoolTask(
  data: CreateSchoolTaskRequest
): Promise<{ success: boolean; message: string; data?: SchoolTask }> {
  const formData = buildSchoolTaskFormData(data);
  const response: AxiosResponse<SchoolTaskMutationResponse> = await axiosClient.post(
    SchoolTaskEndpoints.addSchoolTask,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'School task created successfully',
    data: response.data.data || undefined,
  };
}

export async function getSchoolTaskById(
  id: string
): Promise<{ success: boolean; data?: SchoolTask; message: string }> {
  const response: AxiosResponse<SchoolTaskDetailResponse> = await axiosClient.get(
    SchoolTaskEndpoints.getSchoolTaskById(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'School task fetched successfully',
    data: response.data.data || undefined,
  };
}

export async function updateSchoolTask(
  id: string,
  data: UpdateSchoolTaskRequest
): Promise<{ success: boolean; message: string; data?: SchoolTask }> {
  const formData = buildSchoolTaskFormData(data);
  const response: AxiosResponse<SchoolTaskMutationResponse> = await axiosClient.put(
    SchoolTaskEndpoints.updateSchoolTask,
    formData,
    {
      params: { Id: id },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'School task updated successfully',
    data: response.data.data || undefined,
  };
}

export async function deleteSchoolTask(id: string): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<{
    data: string | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.delete(SchoolTaskEndpoints.deleteSchoolTask(id));

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'School task deleted successfully',
  };
}

export async function getSchoolTaskStatusById(
  params: SchoolTaskStatusQueryParams
): Promise<SchoolTaskStatusListResponse> {
  const response: AxiosResponse<{
    data: Record<string, unknown> | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.get(SchoolTaskEndpoints.getSchoolTaskStatusById, {
    params,
    paramsSerializer: { serialize: serializeParams },
  });

  if (!response?.data?.data) {
    return buildEmptyStatusListResponse(params);
  }

  const data = response.data.data;
  return {
    isSuccess: response.data.isSuccess,
    message: response.data.message,
    validationErrors: response.data.validationErrors,
    data: {
      taskStatuses: mapStatusItems(data),
      pageIndex: Number(data.pageIndex ?? params.PageIndex ?? 1),
      pageSize: Number(data.pageSize ?? params.PageSize ?? 10),
      totalItems: Number(data.totalItems ?? mapStatusItems(data).length),
      totalPages: Number(data.totalPages ?? 0),
    },
  };
}

export async function getAllSchoolTasksByStudentId(
  params?: StudentSchoolTaskQueryParams
): Promise<StudentSchoolTaskListResponse> {
  const response: AxiosResponse<{
    data: Record<string, unknown> | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.get(SchoolTaskEndpoints.getAllSchoolTasksByStudentId, {
    params,
    paramsSerializer: { serialize: serializeParams },
  });

  if (!response?.data?.data) {
    return buildEmptyStudentTaskListResponse(params);
  }

  const data = response.data.data;
  return {
    isSuccess: response.data.isSuccess,
    message: response.data.message,
    validationErrors: response.data.validationErrors,
    data: {
      schoolTasks: mapStudentTaskItems(data),
      pageIndex: Number(data.pageIndex ?? params?.PageIndex ?? 1),
      pageSize: Number(data.pageSize ?? params?.PageSize ?? 10),
      totalItems: Number(data.totalItems ?? mapStudentTaskItems(data).length),
      totalPages: Number(data.totalPages ?? 0),
    },
  };
}

export const schoolTaskApiService = {
  getSchoolTasks,
  createSchoolTask,
  getSchoolTaskById,
  updateSchoolTask,
  deleteSchoolTask,
  getSchoolTaskStatusById,
  getAllSchoolTasksByStudentId,
};

export default schoolTaskApiService;
