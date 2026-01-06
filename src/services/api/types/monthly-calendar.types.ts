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

export interface MonthlyCalendarEvent {
  id: string;
  nameAr: string;
  nameEn: string;
  day: string;
  duration: number;
  startTime: string;
  endTime: string;
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
  StageId?: string;
  ClassRoomId?: string;
  Search?: string;
  Day?: string;
}

export interface BaseMonthlyCalendarRequest {
  nameAr: string;
  nameEn: string;
  day: string;
  duration: number;
  startTime: string;
  endTime: string;
  schoolBranchesId: string;
  grades: string[];
  classRomms: string[];
}

export interface CreateMonthlyCalendarRequest extends BaseMonthlyCalendarRequest {}

export interface UpdateMonthlyCalendarRequest extends BaseMonthlyCalendarRequest {
  id?: string;
}
