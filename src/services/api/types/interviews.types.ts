/**
 * Interview Types
 * Defines the client-side contract for interview-related API responses.
 */

export const InterviewType = {
  ONLINE: 1,
  OFFLINE: 2,
} as const;

export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType];

export interface Interview {
  id: string;
  schoolBranchesId: string;
  jobAdvertisementId: string;
  teacherId: string;
  supervisorId: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  interViewType: InterviewType;
  teacherName?: string;
  supervisorName?: string;
  jobAdvertisementTitle?: string;
  jobAdvertisementName?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewListData {
  interviewDto: Interview[];
  totalItems: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface InterviewListResponse {
  data: InterviewListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface InterviewQueryParams {
  PageIndex?: number;
  PageSize?: number;
  TeacherName?: string;
  SupervisorName?: string;
  Month?: number;
  Year?: number;
  Date?: string;
  teacherId?: string;
  supervisorId?: string;
  jobAdvertisementId?: string;
  SchoolBranchesId?: string;
}

export interface CreateInterviewRequest {
  schoolBranchesId: string;
  jobAdvertisementId: string;
  teacherId: string;
  supervisorId: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  interViewType: InterviewType;
}

export interface UpdateInterviewRequest extends CreateInterviewRequest {
  status?: string;
}
