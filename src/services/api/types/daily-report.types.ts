/**
 * Daily Report Types
 * Defines API contracts for the DailyReport endpoints.
 */

// ============================================================================
// Main Types
// ============================================================================

export interface DailyReportStudent {
  id: string;
  name: string;
  studentPicture: string | null;
}

export interface DailyReport {
  id: string;
  teacherId: string;
  classroomId: string;
  classroomName: string;
  reportNumber: string;
  assignmentType: number;
  gradeId: string;
  gradeName: string;
  academicLevel: number;
  behaviorLevel: number;
  healthLevel: number;
  students: DailyReportStudent[];
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface DailyReportQueryParams {
  PageIndex?: number;
  PageSize?: number;
  Date?: string;
  StudentId?: string;
  TeacherId?: string;
  ClassroomId?: string;
  GradeId?: string;
  AcademicLevel?: number;
  BehaviorLevel?: number;
  HealthLevel?: number;
  Search?: string;
}

export interface DailyReportByParentQueryParams {
  StudentId?: string;
  PageIndex?: number;
  PageSize?: number;
  StartDate?: string;
  EndDate?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface DailyReportListData {
  dailyReportDto: DailyReport[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface DailyReportListResponse {
  isSuccess: boolean;
  message: string;
  data: DailyReportListData;
  validationErrors?: string[] | null;
}

export interface DailyReportDetailResponse {
  isSuccess: boolean;
  message: string;
  data: DailyReport;
  validationErrors?: string[] | null;
}

// ============================================================================
// Request Types
// ============================================================================

export interface CreateDailyReportRequest {
  teacherId: string;
  classroomId: string;
  assignmentType: number;
  gradeId: string;
  academicLevel: number;
  behaviorLevel: number;
  healthLevel: number;
  studentIds: string[];
}

export interface UpdateDailyReportRequest extends CreateDailyReportRequest {
  id: string;
}
