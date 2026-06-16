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

export const RequestParticipantRole = {
  School: 'school',
  Student: 'student',
  Teacher: 'teacher',
} as const;

export type RequestParticipantRole =
  (typeof RequestParticipantRole)[keyof typeof RequestParticipantRole];

export interface RequestParticipant {
  id?: string;
  name: string;
  avatarPath: string | null;
  role: RequestParticipantRole;
}

export interface StudentRequestDto {
  id: string;
  senderName: string;
  senderAvatarPath: string | null;
  senderId?: string;
  senderRole?: RequestParticipantRole;
  senderParticipants?: RequestParticipant[];
  recipientName: string;
  recipientAvatarPath: string | null;
  recipientId?: string;
  recipientRole?: RequestParticipantRole;
  recipientParticipants?: RequestParticipant[];
  messageContent: string;
  status: StudentRequestStatus;
  type: StudentRequestType;
  created: string;
  studentName?: string;
  studentId?: string;
  educationalStage?: string;
  classrooms?: string[];
}

export const SendType = {
  SelectedStudents: 1,
  AllClassroomStudents: 2,
  School: 3,
} as const;

export type SendType = (typeof SendType)[keyof typeof SendType];

export interface CreateSchoolMessageRequest {
  message: string;
  sendType: SendType;
  students: string[];
  classrooms: string[];
  grades: string[];
}

export const MessageStatus = {
  Pending: 1,
  Sent: 2,
  Viewed: 3,
  Replied: 4,
} as const;

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export interface SchoolMessageStudentDto {
  studentId: string;
  studentName: string | null;
  studentimage: string | null;
}

export interface SchoolMessageDto {
  messageId: string;
  message: string;
  createdAt: string;
  messageStatus: MessageStatus;
  schoolBranchesId: string;
  messageReply: string | null;
  sendertype: number;
  recivertype: SendType;
  studentId: string;
  studentName: string | null;
  studentimage: string | null;
  students: SchoolMessageStudentDto[];
  grades: string[];
  classrooms: string[];
}

export interface SchoolMessagesListResponse {
  messages: SchoolMessageDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface SchoolMessagesQueryParams {
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
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
