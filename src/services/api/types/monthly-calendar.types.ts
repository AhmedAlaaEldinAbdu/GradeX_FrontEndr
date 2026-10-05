/**
 * Monthly Calendar Types
 * Defines API contracts for monthly calendar endpoints.
 */

export interface MonthlyCalendarGradeRef {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface MonthlyCalendarClassRef {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface MonthlyEventReference {
  id: string;
  nameAr?: string;
  nameEn?: string;
}

export interface MonthlyEventEntity {
  id: string;
  nameAr: string;
  nameEn: string;
  grades: MonthlyEventReference[];
  classRomms: MonthlyEventReference[];
  day: string; // yyyy-MM-dd
  duration: number;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
  schoolBranchesId: string;
}

export interface MonthlyCalendarEvent {
  id: string;
  nameAr: string;
  nameEn: string;
  day: string;
  duration: number;
  startTime: string | null;
  endTime: string | null;
  schoolBranchesId: string;
  grade: MonthlyCalendarGradeRef[];
  class: MonthlyCalendarClassRef[];
}

export interface MonthlyCalendarListData {
  monthlyCalendarDto: MonthlyCalendarEvent[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface MonthlyCalendarListResponse {
  data?: MonthlyCalendarListData;
  value?: MonthlyCalendarListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface MonthlyCalendarQueryParams {
  PageIndex?: number;
  PageSize?: number;
  SchoolBrancheId?: string;
  Grade?: string;
  ClassRoomId?: string;
  Search?: string;
  Date?: string;
}

export interface MonthlyCalendarDashboardParams {
  FromDate: string;
  ToDate: string;
  SchoolBrancheId?: string;
  grade?: string;
  search?: string;
}

export interface MonthlyCalendarDashboardData {
  monthlyCalendarDto: MonthlyCalendarEvent[];
}

export interface MonthlyCalendarDashboardResponse {
  data: MonthlyCalendarDashboardData | null;
  isSuccess: boolean;
  message: string;
  errorCode: string | null;
  validationErrors: string[] | null;
}

export interface BaseMonthlyCalendarRequest {
  nameAr: string;
  nameEn: string;
  day: string;
  duration: number;
  startTime: string | null;
  endTime: string | null;
  schoolBranchesId: string;
  grades: string[];
  classRomms: string[];
}

export interface CreateMonthlyCalendarRequest extends BaseMonthlyCalendarRequest {}

export interface UpdateMonthlyCalendarRequest extends BaseMonthlyCalendarRequest {
  id?: string;
}
