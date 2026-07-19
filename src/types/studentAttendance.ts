export interface StudentAttendanceCreatedBy {
  createdById: string;
  createdByFullNane: string | null;
  lkAdministrativePositionId: string | null;
  administrativePositionNameAr: string;
  administrativePositionNameEn: string;
}

export interface StudentAttendanceDto {
  id: string | null;
  studentId: string;
  teacherFullName: string;
  lkSchoolStageId: string;
  lkSchoolStageNameAr: string;
  lkSchoolStageNameEn: string;
  classroomId: string;
  classroomNameAr: string;
  classroomNameEn: string;
  job: number | null;
  date: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: number;
  createdBy: StudentAttendanceCreatedBy;
}

export interface StudentAttendanceListData {
  studentsAttends: StudentAttendanceDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentAttendanceListResponse {
  data: StudentAttendanceListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface StudentAttendanceQueryParams {
  SchoolBrancheId: string;
  PageIndex?: number;
  PageSize?: number;
  SearchStudentName?: string;
  GradeId?: string;
  ClassroomId?: string;
  Status?: number;
  Date?: string;
}

// Bulk attendance request
export interface StudentBulkAttendanceItem {
  studentId: string;
  date: string;
  status: number;
  delayTime?: string;
}

export type StudentBulkAttendanceRequest = StudentBulkAttendanceItem[];

// Attendance status constants
export const StudentAttendanceStatus = {
  Present: 1,
  Absent: 2,
  Late: 3,
  EarlyLeave: 4,
} as const;

export interface StudentAttendanceByStudentDto {
  id: string;
  studentId: string;
  date: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: number;
  earlyLeaveReason: string | null;
  earlyLeaveTime: string | null;
}

export interface StudentAttendanceByStudentData {
  attendances: StudentAttendanceByStudentDto[];
  totalAttendance: number;
  totalAbsence: number;
  totalLate: number;
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentAttendanceByStudentQueryParams {
  StudentId: string;
  PageIndex?: number;
  PageSize?: number;
  Status?: number;
  Date?: string;
}
