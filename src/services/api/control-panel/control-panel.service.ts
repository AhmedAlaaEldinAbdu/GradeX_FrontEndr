import { axiosClient } from '@/lib/http';
import type { AxiosResponse } from 'axios';
import { ControlPanelEndpoints } from '../endpoints/control-panel-endpoints';
import type {
  DashboardMetricsQueryParams,
  DashboardMetricsResponse,
  AttendanceStatisticsQueryParams,
  AttendanceStatisticsResponse,
} from '../types/control-panel.types';

/**
 * Get dashboard metrics (teachers, students, classes and applications summary)
 * for a given school branch.
 */
export async function getDashboardMetrics(
  params: DashboardMetricsQueryParams
): Promise<DashboardMetricsResponse> {
  const response: AxiosResponse<DashboardMetricsResponse> = await axiosClient.get(
    ControlPanelEndpoints.dashboardMetrics,
    { params }
  );

  if (!response?.data) {
    return {
      data: {
        totalTeachers: 0,
        totalStudents: 0,
        totalClasses: 0,
        totalStudentsRequests: 0,
        totalStudentApplications: {
          totalAcceptance: 0,
          totalRejection: 0,
          totalPending: 0,
          totalMissingData: 0,
        },
      },
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

/**
 * Get attendance statistics per educational stage for a given school branch,
 * filtered by day / week / month.
 */
export async function getAttendanceStatistics(
  params: AttendanceStatisticsQueryParams
): Promise<AttendanceStatisticsResponse> {
  const response: AxiosResponse<AttendanceStatisticsResponse> = await axiosClient.get(
    ControlPanelEndpoints.attendanceStatistics,
    { params }
  );

  if (!response?.data) {
    return {
      data: [],
      isSuccess: false,
      message: '',
      validationErrors: null,
    };
  }

  return response.data;
}

// ============================================================================
// Export Service Object
// ============================================================================

export const controlPanelApiService = {
  getDashboardMetrics,
  getAttendanceStatistics,
};
