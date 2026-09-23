import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { TaskCorrectionEndpoints } from '../endpoints/task-correction-endpoints';
import type {
  CreateTaskCorrectionRequest,
  TaskCorrection,
  TaskCorrectionMutationResponse,
  TaskCorrectionResponse,
  UpdateTaskCorrectionRequest,
} from '@/types/taskCorrections';

function buildTaskCorrectionFormData(
  data: CreateTaskCorrectionRequest | UpdateTaskCorrectionRequest
): FormData {
  const formData = new FormData();

  formData.append('TaskStudentId', data.taskStudentId);
  formData.append('CorrectionType', String(data.correctionType));

  if (data.studentScore !== undefined) {
    formData.append('StudentScore', String(data.studentScore));
  }

  if (data.maxScore !== undefined) {
    formData.append('MaxScore', String(data.maxScore));
  }

  if (data.evaluationGrade !== undefined) {
    formData.append('EvaluationGrade', String(data.evaluationGrade));
  }

  if (data.feedback) {
    formData.append('Feedback', data.feedback);
  }

  if ('id' in data && data.id) {
    formData.append('Id', data.id);
  }

  if (data.attachment?.length) {
    data.attachment.forEach((file) => {
      formData.append('Attachment', file);
    });
  }

  return formData;
}

export async function getTaskCorrectionByTaskStudentId(
  taskStudentId: string
): Promise<{ success: boolean; data?: TaskCorrection; message: string }> {
  const response: AxiosResponse<TaskCorrectionResponse> = await axiosClient.get(
    TaskCorrectionEndpoints.getTaskCorrectionByTaskStudentId(taskStudentId)
  );

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Task correction fetched successfully',
    data: response.data.data || undefined,
  };
}

export async function createTaskCorrection(
  data: CreateTaskCorrectionRequest
): Promise<{ success: boolean; message: string; data?: TaskCorrection }> {
  const formData = buildTaskCorrectionFormData(data);
  const response: AxiosResponse<TaskCorrectionMutationResponse> = await axiosClient.post(
    TaskCorrectionEndpoints.addTaskCorrection,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Task correction created successfully',
    data: response.data.data || undefined,
  };
}

export async function updateTaskCorrection(
  id: string,
  data: UpdateTaskCorrectionRequest
): Promise<{ success: boolean; message: string; data?: TaskCorrection }> {
  const formData = buildTaskCorrectionFormData(data);
  const response: AxiosResponse<TaskCorrectionMutationResponse> = await axiosClient.put(
    TaskCorrectionEndpoints.updateTaskCorrection,
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
    message: response.data.message || 'Task correction updated successfully',
    data: response.data.data || undefined,
  };
}

export async function deleteTaskCorrection(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<{
    data: string | null;
    isSuccess: boolean;
    message: string;
    validationErrors: string[] | null;
  }> = await axiosClient.delete(TaskCorrectionEndpoints.deleteTaskCorrection(id));

  return {
    success: response.data.isSuccess,
    message: response.data.message || 'Task correction deleted successfully',
  };
}

export const taskCorrectionApiService = {
  getTaskCorrectionByTaskStudentId,
  createTaskCorrection,
  updateTaskCorrection,
  deleteTaskCorrection,
};

export default taskCorrectionApiService;
