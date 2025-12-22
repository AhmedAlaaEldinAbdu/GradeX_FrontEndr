/**
 * Teacher Attendance Details Types
 * Types for individual teacher attendance records
 */

// ============================================================================
// Single Teacher Attendance Record
// ============================================================================

export interface TeacherAttendanceDetailRecord {
  id: string;
  teacherId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: number;
  earlyLeaveReason: string | null;
  earlyLeaveTime: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TeacherAttendanceDetailData {
  attendances: TeacherAttendanceDetailRecord[];
  totalAttendance: number;
  totalAbsence: number;
  totalLate: number;
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface TeacherAttendanceDetailResponse {
  attendances: TeacherAttendanceDetailRecord[];
  totalAttendance: number;
  totalAbsence: number;
  totalLate: number;
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface TeacherAttendanceDetailQueryParams {
  TeacherId: string;
  PageIndex?: number;
  PageSize?: number;
  Status?: number;
}

// ============================================================================
// Filters
// ============================================================================

export interface TeacherAttendanceDetailFilters {
  status?: number;
  searchDate?: string;
}

// ============================================================================
// Summary
// ============================================================================

export interface TeacherAttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}
