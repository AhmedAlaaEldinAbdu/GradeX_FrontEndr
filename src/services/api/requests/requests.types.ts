/**
 * Types for the Student Requests (الطلبات) domain.
 *
 * Backend integration is pending — these DTOs mirror the shapes the API is
 * expected to return so the UI and (future) service/slice stay type-safe.
 */

export const StudentRequestStatus = {
  Sent: 1, // تم إرسال
  Viewed: 2, // تم الإطلاع
  Replied: 3, // تم الرد
  Pending: 4, // قيد الانتظار
} as const;

export type StudentRequestStatus = (typeof StudentRequestStatus)[keyof typeof StudentRequestStatus];

export const StudentRequestType = {
  Applications: 'applications', // طلبات التقديم
  EarlyLeave: 'early-leave', // طلب خروج مبكر
  Messages: 'messages', // الرسائل
  Reminder: 'reminder', // تذكير
  AddDelegate: 'add-delegate', // إضافة مفوض
  ContractAuthentication: 'contract-authentication', // طلب توثيق عقد
} as const;

export type StudentRequestType = (typeof StudentRequestType)[keyof typeof StudentRequestType];

export interface StudentRequestDto {
  id: string;
  senderName: string;
  senderAvatarPath: string | null;
  recipientName: string;
  recipientAvatarPath: string | null;
  messageContent: string;
  status: StudentRequestStatus;
  type: StudentRequestType;
  created: string;
}

export interface StudentRequestsListResponse {
  requestDtos: StudentRequestDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentRequestsQueryParams {
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  Status?: number;
  Type?: string;
  SchoolBranchesId?: string;
}

export interface StudentRequestsStats {
  pending: number;
  acceptedPercentage: number;
  rejected: number;
  total: number;
}
