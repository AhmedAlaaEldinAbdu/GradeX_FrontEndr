/**
 * School Message API Service
 * Handles creating messages directed to students/classrooms (الرسائل).
 */
import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { SchoolMessageEndpoints } from '../endpoints/school-message-endpoints';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';
import type { ApiResponseModel } from '../config';
import type {
  CreateSchoolMessageRequest,
  SchoolMessagesListResponse,
  SchoolMessagesQueryParams,
  StudentMessageDto,
  StudentMessagesResponse,
} from './requests.types';

/**
 * Create a school message.
 */
export async function createSchoolMessage(
  data: CreateSchoolMessageRequest
): Promise<ApiResponseModel<null>> {
  const schoolBranchId = getCurrentSchoolBranchId();
  const formData = new FormData();

  formData.append('message', data.message);
  formData.append('SendType', String(data.sendType));
  data.students.forEach((studentId) => formData.append('Students', studentId));
  data.classrooms.forEach((classroomId) => formData.append('Classrooms', classroomId));
  data.grades.forEach((gradeId) => formData.append('Grades', gradeId));
  data.attachments?.forEach((file) => formData.append('Attachments', file));

  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.post(
    SchoolMessageEndpoints.create,
    formData,
    {
      params: { schoolBranchId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
}

/**
 * Get the paginated list of school messages.
 */
export async function getAllSchoolMessages(
  params?: SchoolMessagesQueryParams
): Promise<SchoolMessagesListResponse> {
  const SchoolBranchId = getCurrentSchoolBranchId();
  const response: AxiosResponse<ApiResponseModel<SchoolMessagesListResponse>> =
    await axiosClient.get(SchoolMessageEndpoints.getAll, {
      params: { SchoolBranchId, ...params },
    });

  const data = response.data.data ?? response.data.value;
  if (data) {
    return {
      ...data,
      totalMessages: data.totalMessages ?? data.totalItems ?? 0,
      statusCounts: data.statusCounts ?? [],
    };
  }

  return {
    messages: [],
    totalMessages: 0,
    statusCounts: [],
    pageIndex: params?.PageNumber ?? 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: params?.PageSize ?? 10,
  };
}

/**
 * Reply to a school message (multipart PUT to /SchoolMessage).
 */
export async function replyToSchoolMessage(
  messageId: string,
  messageReply: string
): Promise<ApiResponseModel<null>> {
  const formData = new FormData();
  formData.append('MessageId', messageId);
  formData.append('messageReply', messageReply);

  const response: AxiosResponse<ApiResponseModel<null>> = await axiosClient.put(
    SchoolMessageEndpoints.base,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
}

/**
 * Get the messages exchanged with a single student (used by the reply view).
 */
export async function getMessageByStudentId(studentId: string): Promise<StudentMessageDto[]> {
  const SchoolBranchId = getCurrentSchoolBranchId();
  const response: AxiosResponse<ApiResponseModel<StudentMessagesResponse>> = await axiosClient.get(
    SchoolMessageEndpoints.getByStudentId,
    { params: { StudentId: studentId, SchoolBranchId } }
  );

  const data = response.data.data ?? response.data.value;
  return data?.messages ?? [];
}

export async function markSchoolMessageAsViewed(id: string): Promise<void> {
  await axiosClient.put(SchoolMessageEndpoints.markAsViewed(id));
}

export const schoolMessageApiService = {
  createSchoolMessage,
  getAllSchoolMessages,
  getMessageByStudentId,
  markSchoolMessageAsViewed,
  replyToSchoolMessage,
};

export default schoolMessageApiService;
