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
  studentName?: string;
  educationalStage?: string;
  classrooms?: string[];
}

/** Status of an early-leave (طلب خروج مبكر) request. */
export const EarlyLeaveStatus = {
  Pending: 1, // قيد الانتظار
  Accepted: 2, // مقبول
  Rejected: 3, // مرفوض
} as const;

export type EarlyLeaveStatus = (typeof EarlyLeaveStatus)[keyof typeof EarlyLeaveStatus];

export interface EarlyLeaveRequestDto {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarPath: string | null;
  /** Departure time, e.g. "2:00 مساءا". */
  time: string;
  /** Early-leave duration, e.g. "ساعتين". */
  duration: string;
  /** Request date, e.g. "1/1/2020". */
  date: string;
  stage: string;
  classroom: string;
  status: EarlyLeaveStatus;
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
