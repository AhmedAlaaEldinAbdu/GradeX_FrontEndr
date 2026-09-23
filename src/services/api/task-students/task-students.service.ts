import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { TaskStudentEndpoints } from '../endpoints/task-student-endpoints';
import type {
  StudentMaterialTaskListResponse,
  StudentMaterialTasksQueryParams,
  StudentExamsListResponse,
  StudentExamsQueryParams,
  StudentHomeworkListResponse,
  StudentHomeworkQueryParams,
  TaskStudent,
  TaskStudentMutationResponse,
  TaskStudentResponse,
  UpdateTaskStudentRequest,
} from '@/types/taskStudents';

const serializeQuery = (params?: Record<string, unknown>) => {
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

const serializeParams = (params?: StudentMaterialTasksQueryParams) => {
  const searchParams = new URLSearchParams();

  if (!params) {
    return searchParams.toString();
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams.toString();
};

function buildUpdateTaskStudentFormData(data: UpdateTaskStudentRequest): FormData {
  const formData = new FormData();

  formData.append('Id', data.id);

  if (data.attachment?.length) {
    data.attachment.forEach((file) => {
      formData.append('Attachment', file);
    });
  }

  return formData;
}

const buildEmptyStudentMaterialTaskListResponse = (): StudentMaterialTaskListResponse => ({
  data: {
    taskStudents: [],
    totalItems: 0,
    totalPages: 0,
    pageIndex: 1,
    pageSize: 10,
  },
  isSuccess: false,
  message: '',
  validationErrors: null,
});

const mapStudentMaterialTasks = (data?: Record<string, unknown>): TaskStudent[] => {
  if (!data) {
    return [];
  }

  const candidates = [
    data.taskStudents,
    data.taskStudentDto,
    data.studentMaterialTasks,
    data.studentMaterialTaskDto,
    data.items,
  ];

  const matched = candidates.find(Array.isArray);
  return Array.isArray(matched) ? (matched as TaskStudent[]) : [];
};

export async function getTaskStudentById(
  id: string
): Promise<{ success: boolean; data?: TaskStudent; message: string }> {
  const response: AxiosResponse<TaskStudentResponse> = await axiosClient.get(
    TaskStudentEndpoints.getTaskStudentById(id)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Task student fetched successfully',
    data: response.data.data || undefined,
  };
}

export async function deleteTaskStudent(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<{
    data: string | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.delete(TaskStudentEndpoints.deleteTaskStudent(id));

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Task student deleted successfully',
  };
}

export async function getStudentMaterialTasks(
  studentId: string,
  params?: StudentMaterialTasksQueryParams
): Promise<StudentMaterialTaskListResponse> {
  const response: AxiosResponse<{
    data: Record<string, unknown> | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.get(TaskStudentEndpoints.getStudentMaterialTasks(studentId), {
    params,
    paramsSerializer: { serialize: serializeParams },
  });

  if (!response?.data?.data) {
    return buildEmptyStudentMaterialTaskListResponse();
  }

  const data = response.data.data;
  const items = mapStudentMaterialTasks(data);

  return {
    isSuccess: response.data.isSuccess,
    message: response.data.message,
    validationErrors: response.data.validationErrors,
    data: {
      taskStudents: items,
      pageIndex: Number(data.pageIndex ?? 1),
      //   pageSize: Number(data.pageSize ?? items.length ?? 10),
      pageSize: Number((data.pageSize ?? items.length) || 10),
      totalItems: Number(data.totalItems ?? items.length),
      totalPages: Number(data.totalPages ?? 0),
    },
  };
}

export async function updateTaskStudent(
  id: string,
  data: UpdateTaskStudentRequest
): Promise<{ success: boolean; message: string; data?: TaskStudent }> {
  const formData = buildUpdateTaskStudentFormData(data);
  const response: AxiosResponse<TaskStudentMutationResponse> = await axiosClient.put(
    TaskStudentEndpoints.updateTaskStudent,
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
    message: response.data.message || 'Task student updated successfully',
    data: response.data.data || undefined,
  };
}

export async function getStudentExams(
  studentId: string,
  params?: StudentExamsQueryParams
): Promise<StudentExamsListResponse> {
  const response: AxiosResponse<StudentExamsListResponse> = await axiosClient.get(
    TaskStudentEndpoints.getStudentExams(studentId),
    {
      params,
      paramsSerializer: { serialize: serializeQuery },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        exams: [],
        pageIndex: params?.PageIndex || 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: params?.PageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export async function getStudentHomework(
  studentId: string,
  params?: StudentHomeworkQueryParams
): Promise<StudentHomeworkListResponse> {
  const response: AxiosResponse<StudentHomeworkListResponse> = await axiosClient.get(
    TaskStudentEndpoints.getStudentHomework(studentId),
    {
      params,
      paramsSerializer: { serialize: serializeQuery },
    }
  );

  if (!response?.data?.data) {
    return {
      data: {
        exams: [],
        pageIndex: params?.PageIndex || 1,
        totalPages: 0,
        totalItems: 0,
        pageSize: params?.PageSize || 10,
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

export const taskStudentApiService = {
  getTaskStudentById,
  deleteTaskStudent,
  getStudentMaterialTasks,
  updateTaskStudent,
  getStudentExams,
  getStudentHomework,
};

export default taskStudentApiService;
