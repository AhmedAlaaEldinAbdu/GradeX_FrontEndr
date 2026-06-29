import type { ValidationErrorResponse } from '../config';

export const SchoolNotificationTarget = {
  Employees: 1,
  Parents: 2,
} as const;

export type SchoolNotificationTargetValue =
  (typeof SchoolNotificationTarget)[keyof typeof SchoolNotificationTarget];

export interface SendSchoolNotificationRequest {
  schoolBranchId: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  targets: SchoolNotificationTargetValue;
  gradeIds?: string[];
  classroomIds?: string[];
  teacherUserIds?: string[];
  studentIds?: string[];
  attachments?: File[];
}

export interface SendSchoolNotificationResponse {
  data?: unknown;
  value?: unknown;
  status?: number;
  isSuccess: boolean;
  successMessage?: string;
  message?: string;
  correlationId?: string;
  location?: string;
  errors?: string[];
  validationErrors?: ValidationErrorResponse[] | string[] | Record<string, string[]> | null;
}

export interface SchoolNotificationAttachment {
  id: string;
  fileName: string;
  filePath: string;
}

export interface SchoolNotificationRecipientStudent {
  studentId: string;
  studentName: string;
  gradeId: string;
  gradeNameAr: string;
  gradeNameEn: string;
  classroomId: string;
  classroomNameAr: string;
  classroomNameEn: string;
}

export interface SchoolNotificationRecipient {
  id: string;
  fullName: string;
  imagePath: string | null;
  students: SchoolNotificationRecipientStudent[] | null;
}

export interface SchoolNotificationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  target: SchoolNotificationTargetValue;
  created: string;
  totalTeachers: number;
  totalParents: number;
  teachers: SchoolNotificationRecipient[];
  parents: SchoolNotificationRecipient[];
  attachments: SchoolNotificationAttachment[];
}

export interface GetSchoolNotificationsRequest {
  SchoolBranchId: string;
  Target: SchoolNotificationTargetValue;
  PageIndex?: number;
  PageSize?: number;
}

export interface SchoolNotificationMetrics {
  totalNotifications: number;
  totalTeacherNotifications: number;
  totalParentNotifications: number;
}

export interface SchoolNotificationListData extends SchoolNotificationMetrics {
  items: SchoolNotificationItem[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface GetSchoolNotificationsResponse {
  data: SchoolNotificationListData;
  isSuccess: boolean;
  message: string;
  validationErrors?: ValidationErrorResponse[] | string[] | Record<string, string[]> | null;
}
