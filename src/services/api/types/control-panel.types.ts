/**
 * Control Panel Types
 * Defines API contracts for the school control panel endpoints.
 */

export interface DashboardMetricsQueryParams {
  SchoolBranchId: string;
}

export interface DashboardStudentApplications {
  totalAcceptance: number;
  totalRejection: number;
  totalPending: number;
  totalMissingData: number;
}

export interface DashboardMetrics {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalStudentsRequests: number;
  totalStudentApplications: DashboardStudentApplications;
}

export interface DashboardMetricsResponse {
  data: DashboardMetrics;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

// ============================================================================
// Attendance Statistics
// ============================================================================

export interface AttendanceStatisticsQueryParams {
  SchoolBranchId: string;
  FilterType: number; // AttendanceFilterType: Day=1, Week=2, Month=3
}

export interface AttendanceStageStat {
  stageId: string;
  stageNameAr: string;
  stageNameEn: string;
  attendancePercentage: number;
  presentCount: number;
  totalCount: number;
}

export interface AttendanceStatisticsResponse {
  data: AttendanceStageStat[];
  // TODO: confirm exact shape/placement once backend pushes the commit.
  // ChangePercentage = the % vs last period; IsIncrease = arrow points up when true.
  changePercentage?: number | null;
  isIncrease?: boolean;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}
