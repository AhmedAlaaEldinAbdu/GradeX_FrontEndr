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
