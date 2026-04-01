/**
 * Academic Calendar Types
 * Defines API contracts for academic calendar endpoints.
 */

export const AcademicCalendarTimePeriodScope = {
  YEAR: 1,
  CUSTOM: 2,
} as const;

export type AcademicCalendarTimePeriodScope =
  (typeof AcademicCalendarTimePeriodScope)[keyof typeof AcademicCalendarTimePeriodScope];

export interface AcademicCalendarDaySchedule {
  id?: string;
  days: number[];
  dayStartTime: string;
  dayEndTime: string;
}

export interface AcademicCalendarTimedSchedule {
  id?: string;
  timePeriodScope: number;
  startTime: string;
  endTime: string;
  days: number[];
}

export const AcademicCalendarDayMapping = {
  SATURDAY: 0,
  SUNDAY: 1,
  MONDAY: 2,
  TUESDAY: 3,
  WEDNESDAY: 4,
  THURSDAY: 5,
  FRIDAY: 6,
} as const;

export interface AcademicCalendarEntity {
  id: string;
  schoolBrancheId?: string;
  schoolBranchId?: string;

  // Newer backend fields
  gradeId?: string;
  gradeNameAr?: string | null;
  gradeNameEn?: string | null;

  lkSchoolStageId: string;
  lkSchoolStageNameAr?: string | null;
  lkSchoolStageNameEn?: string | null;
  studyStartDate: string;
  studyEndDate: string;
  topicAr?: string | null;
  topicEn?: string | null;
  contentAr?: string | null;
  contentEn?: string | null;
  weeksCount: number;
  lessonDuration: number;
  daySchedules: AcademicCalendarDaySchedule[];
  breaks: AcademicCalendarTimedSchedule[];
  assemblies: AcademicCalendarTimedSchedule[];
  breakfasts: AcademicCalendarTimedSchedule[];
}

export interface AcademicCalendarListData {
  academicCalendarDto?: AcademicCalendarEntity[];
  calendars?: AcademicCalendarEntity[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface AcademicCalendarListResponse {
  data?: AcademicCalendarListData;
  value?: AcademicCalendarListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface AcademicCalendarQueryParams {
  schoolBranchId?: string;
  PageSize?: number;
  PageIndex?: number;
  Search?: string;
  StartDate?: string;
  EndDate?: string;
}

export interface CreateAcademicCalendarRequest {
  schoolBrancheId: string;
  lkSchoolStageId: string;
  studyStartDate: string;
  studyEndDate: string;
  weeksCount: number;
  lessonDuration: number;
  daySchedules: AcademicCalendarDaySchedule[];
  breaks: AcademicCalendarTimedSchedule[];
  assemblies: AcademicCalendarTimedSchedule[];
  breakfasts: AcademicCalendarTimedSchedule[];
}

export interface UpdateAcademicCalendarRequest extends CreateAcademicCalendarRequest {
  id?: string;
}
