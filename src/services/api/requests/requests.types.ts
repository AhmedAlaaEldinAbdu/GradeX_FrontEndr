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
  Parent: 'parent',
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
  isFromStudent?: boolean;
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

export const MessageSenderType = {
  School: 1,
  Student: 2,
} as const;

export type MessageSenderType = (typeof MessageSenderType)[keyof typeof MessageSenderType];

export interface SchoolMessageStudentDto {
  studentId: string;
  studentName: string | null;
  studentimage: string | null;
}

export interface SchoolMessageDto {
  messageId: string;
  message: string;
  createdAt: string;
  messageStatus: MessageStatus | 0;
  schoolBranchesId: string;
  messageReply: string | null;
  sendertype: number;
  recivertype: number;
  studentId: string;
  studentName: string | null;
  studentimage: string | null;
  students: SchoolMessageStudentDto[];
  grades: string[];
  classrooms: string[];
}

export interface MessageStatusCount {
  status: MessageStatus | 0;
  count: number;
}

export interface SchoolMessagesListResponse {
  messages: SchoolMessageDto[];
  totalMessages: number;
  statusCounts: MessageStatusCount[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/** A single message as returned by GetMessageByStudentId. */
export interface StudentMessageDto {
  id: string;
  message: string;
  createdAt: string;
  messageStatus: MessageStatus;
  schoolBranchesId: string;
  messageReply: string | null;
  sender: string;
  reciver: string;
  studentId: string;
  gradeId: string | null;
  gradeNameAr: string | null;
  gradeNameEN: string | null;
  classroomId: string | null;
  classroomNameAr: string | null;
  classroomNameEN: string | null;
}

export interface StudentMessagesResponse {
  messages: StudentMessageDto[];
}

export interface SchoolMessagesQueryParams {
  PageNumber?: number;
  PageSize?: number;
  SearchStudentName?: string;
  MessageStatus?: MessageStatus;
  Date?: string;
}

/** Status of an early-leave (طلب خروج مبكر) request. */
export const EarlyLeaveStatus = {
  Pending: 1, // قيد الانتظار
  Accepted: 2, // مقبول
  Rejected: 3, // مرفوض
} as const;

export type EarlyLeaveStatus = (typeof EarlyLeaveStatus)[keyof typeof EarlyLeaveStatus];

export interface EarlyLeaveStatusCount {
  status: EarlyLeaveStatus;
  count: number;
}

export interface EarlyLeaveRequestDto {
  id: string;
  studentId: string;
  schoolBranchId?: string | null;
  attendanceId?: string | null;
  schoolName?: string | null;
  studentName: string;
  studentNameFromRequest?: boolean;
  studentAvatarPath: string | null;
  time: string;
  duration: string;
  rawDate?: string | null;
  fromTime?: string | null;
  toTime?: string | null;
  durationMinutes?: number | null;
  reason?: string | null;
  attachments?: StudentEarlyLeaveAttachmentDto[];
  /** Request date, e.g. "1/1/2020". */
  date: string;
  stage: string;
  stageFromRequest?: boolean;
  classroom: string;
  classroomFromRequest?: boolean;
  status: EarlyLeaveStatus;
}

export interface StudentEarlyLeaveAttachmentDto {
  id?: string | null;
  name?: string | null;
  file?: string | null;
  filePath?: string | null;
  url?: string | null;
  [key: string]: unknown;
}

export interface StudentEarlyLeaveRequestApiDto {
  id?: string | null;
  requestId?: string | null;
  studentRequestEarlyLeaveId?: string | null;
  studentId?: string | null;
  attendanceId?: string | null;
  schoolBranchId?: string | null;
  schoolName?: string | null;
  date?: string | null;
  requestDate?: string | null;
  createdAt?: string | null;
  fromTime?: string | null;
  toTime?: string | null;
  duration?: string | null;
  reason?: string | null;
  requestStatus?: number | null;
  status?: number | null;
  studentName?: string | null;
  studentFullName?: string | null;
  fullName?: string | null;
  name?: string | null;
  studentImage?: string | null;
  studentimage?: string | null;
  studentAvatarPath?: string | null;
  profilePicture?: string | null;
  grade?: string | null;
  gradeName?: string | null;
  gradeNameAr?: string | null;
  gradeNameEn?: string | null;
  gradeNameEN?: string | null;
  educationalStage?: string | null;
  stage?: string | null;
  classroom?: string | null;
  classroomName?: string | null;
  classroomNameAr?: string | null;
  classroomNameEn?: string | null;
  classroomNameEN?: string | null;
  className?: string | null;
  attachments?: StudentEarlyLeaveAttachmentDto[] | null;
  [key: string]: unknown;
}

export interface StudentEarlyLeaveRequestsQueryParams {
  SchoolBrancheId?: string;
  PageNumber?: number;
  PageSize?: number;
  SearchStudentName?: string;
  RequestStatus?: EarlyLeaveStatus;
  Date?: string;
  GradeId?: string;
  ClassroomId?: string;
}

export interface CreateStudentEarlyLeaveRequest {
  StudentId: string;
  SchoolBranchId: string;
  Date: string;
  FromTime: string;
  ToTime: string;
  Reason: string;
}

export interface UpdateStudentEarlyLeaveRequest extends CreateStudentEarlyLeaveRequest {
  Id: string;
  Attachment?: File | Blob | string | null;
}

export interface StudentEarlyLeaveRequestsListResponse {
  requests: EarlyLeaveRequestDto[];
  totalRequests: number;
  statusCounts: EarlyLeaveStatusCount[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

/** A delegate-assignment (إضافة مفوض) request row. */
export interface DelegateRequestDto {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarPath: string | null;
  delegateName: string;
  delegateAvatarPath: string | null;
  mobile: string;
  whatsapp: string;
  email: string;
  stage: string;
  classroom: string;
}

/** Status of a contract-authentication (طلب توثيق عقد) request. */
export const ContractAuthStatus = {
  Pending: 1, // قيد انتظار التوثيق
  Authenticated: 2, // موثق
} as const;

export type ContractAuthStatus = (typeof ContractAuthStatus)[keyof typeof ContractAuthStatus];

export interface ContractAuthRequestDto {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarPath: string | null;
  /** Authentication date, e.g. "1/1/2020". */
  date: string;
  status: ContractAuthStatus;
  /** Server path/URL of the contract PDF. */
  contractUrl: string | null;
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

export const RequestAppointmentParticipant = {
  School: 1,
  Parent: 2,
} as const;

export type RequestAppointmentParticipant =
  (typeof RequestAppointmentParticipant)[keyof typeof RequestAppointmentParticipant];

export interface RequestAppointmentDto {
  id: string;
  schoolBranchesId: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  appointmentReciver: RequestAppointmentParticipant;
  appointmentSender: RequestAppointmentParticipant;
  date: string;
  reason: string | null;
}

export interface RequestAppointmentsData {
  requestAppointmentDto: RequestAppointmentDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface RequestAppointmentsListResponse {
  appointments: RequestAppointmentDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface RequestAppointmentsQueryParams {
  PageIndex?: number;
  PageSize?: number;
  StudentName?: string;
  Date?: string;
}
