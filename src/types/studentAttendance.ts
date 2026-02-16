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
  Search?: string;
  LKSchoolStageId?: string;
  ClassroomId?: string;
  Status?: number;
}
