/**
 * Student Interviews Types
 * Defines the client-side contract for student interview-related API responses.
 */

export interface StudentInterview {
  id: string;
  nameAr: string;
  nameEn: string;
  schoolBranchesId: string;
  studentId: string;
  applicationId?: string;
  supervisorId: string;
  interviewDate: string;
  startTime: string;
  endTime: string;

  // Optional fields that may be returned by list/detail endpoints
  studentName?: string;
  /** Some endpoints return `supervisor` instead of `supervisorName`. */
  supervisor?: string;
  supervisorName?: string;
  schoolBranchName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentInterviewListData {
  studentInterviewDto: StudentInterview[];
  totalItems: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface StudentInterviewListResponse {
  data: StudentInterviewListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: Record<string, string[]> | null;
}

export interface StudentInterviewQueryParams {
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  StudentName?: string;
  StudentId?: string;
  SupervisorId?: string;
  schoolBranchId?: string;
  GradeId?: string;
  Date?: string;
  Month?: number;
  Year?: number;
}

export interface CreateStudentInterviewRequest {
  nameAr?: string;
  nameEn?: string;
  schoolBranchesId: string;
  studentId: string;
  supervisorId?: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
}

export type UpdateStudentInterviewRequest = CreateStudentInterviewRequest;
