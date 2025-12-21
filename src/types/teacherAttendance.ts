export interface TeacherAttendanceClassroom {
  classroomId: string;
  classroomNameAr: string;
  classroomNameEn: string;
}

export interface TeacherAttendanceCreatedBy {
  createdById: string;
  createdByFullNane: string | null;
  lkAdministrativePositionId: string | null;
  administrativePositionNameAr: string;
  administrativePositionNameEn: string;
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  teacherFullName: string;
  lkSchoolStageId: string | null;
  lkSchoolStageNameAr: string | null;
  lkSchoolStageNameEn: string | null;
  classRooms: TeacherAttendanceClassroom[];
  job: number;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: number | null;
  createdBy: TeacherAttendanceCreatedBy;
}

export interface TeacherAttendanceListData {
  teachersAttends: TeacherAttendance[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface TeacherAttendanceListResponse {
  data: TeacherAttendanceListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface TeacherAttendanceQueryParams {
  SchoolBrancheId: string;
  PageIndex?: number;
  PageSize?: number;
  SearchName?: string;
  EducationalStageId?: string;
  ClassroomId?: string;
  Job?: number;
}

export interface TeacherAttendanceFilters {
  searchName?: string;
  educationalStageId?: string;
  classroomId?: string;
  job?: number;
}

// Attendance status constants
export const AttendanceStatus = {
  Present: 1,
  Absent: 2,
  Late: 3,
  EarlyLeave: 4,
} as const;

export type AttendanceStatusType = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

// Job type constants
export const TeacherJobType = {
  Teacher: 1,
  Administrator: 2,
  Supervisor: 3,
} as const;

export type TeacherJobTypeType = (typeof TeacherJobType)[keyof typeof TeacherJobType];
