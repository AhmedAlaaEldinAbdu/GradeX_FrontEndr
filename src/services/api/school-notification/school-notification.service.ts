import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { SchoolNotificationEndpoints } from '../endpoints/school-notification-endpoints';
import type {
  GetSchoolNotificationsRequest,
  GetSchoolNotificationsResponse,
  SchoolNotificationListData,
  SendSchoolNotificationRequest,
  SendSchoolNotificationResponse,
} from '../types/school-notification.types';

const appendMany = (formData: FormData, key: string, values?: string[]) => {
  values?.filter(Boolean).forEach((value) => formData.append(key, value));
};

const buildSchoolNotificationFormData = (data: SendSchoolNotificationRequest): FormData => {
  const formData = new FormData();

  formData.append('TitleEn', data.titleEn);
  formData.append('TitleAr', data.titleAr);
  formData.append('BodyEn', data.bodyEn);
  formData.append('BodyAr', data.bodyAr);
  formData.append('Targets', String(data.targets));

  appendMany(formData, 'GradeIds', data.gradeIds);
  appendMany(formData, 'ClassroomIds', data.classroomIds);
  appendMany(formData, 'TeacherUserIds', data.teacherUserIds);
  appendMany(formData, 'StudentIds', data.studentIds);
  data.attachments?.forEach((file) => formData.append('Attachments', file));

  return formData;
};

const buildEmptySchoolNotificationListResponse = (
  params: GetSchoolNotificationsRequest
): GetSchoolNotificationsResponse => ({
  data: {
    totalNotifications: 0,
    totalTeacherNotifications: 0,
    totalParentNotifications: 0,
    items: [],
    pageIndex: params.PageIndex || 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: params.PageSize || 10,
  },
  isSuccess: false,
  message: '',
  validationErrors: null,
});

type SchoolNotificationListPayload = Partial<GetSchoolNotificationsResponse> & {
  data?: SchoolNotificationListData;
  value?: SchoolNotificationListData;
};

const normalizeSchoolNotificationListResponse = (
  params: GetSchoolNotificationsRequest,
  payload: SchoolNotificationListPayload
): GetSchoolNotificationsResponse => {
  const data = payload.data?.items
    ? payload.data
    : payload.value?.items
      ? payload.value
      : undefined;

  if (!data) {
    return buildEmptySchoolNotificationListResponse(params);
  }

  return {
    data: {
      totalNotifications: data.totalNotifications ?? 0,
      totalTeacherNotifications: data.totalTeacherNotifications ?? 0,
      totalParentNotifications: data.totalParentNotifications ?? 0,
      items: Array.isArray(data.items) ? data.items : [],
      pageIndex: data.pageIndex ?? params.PageIndex ?? 1,
      totalPages: data.totalPages ?? 0,
      totalItems: data.totalItems ?? 0,
      pageSize: data.pageSize ?? params.PageSize ?? 10,
    },
    isSuccess: payload.isSuccess ?? true,
    message: payload.message ?? '',
    validationErrors: payload.validationErrors ?? null,
  };
};

export async function getSchoolNotifications(
  params: GetSchoolNotificationsRequest
): Promise<GetSchoolNotificationsResponse> {
  const response: AxiosResponse<GetSchoolNotificationsResponse> = await axiosClient.get(
    SchoolNotificationEndpoints.list,
    { params }
  );

  return normalizeSchoolNotificationListResponse(params, response.data);
}

export async function sendSchoolNotification(
  data: SendSchoolNotificationRequest
): Promise<SendSchoolNotificationResponse> {
  const response: AxiosResponse<SendSchoolNotificationResponse> = await axiosClient.post(
    SchoolNotificationEndpoints.send,
    buildSchoolNotificationFormData(data),
    {
      params: { schoolBranchId: data.schoolBranchId },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

export const schoolNotificationApiService = {
  getSchoolNotifications,
  sendSchoolNotification,
};

export default schoolNotificationApiService;
