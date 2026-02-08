export const StudentApplicationStatus = {
  Modified: 1, // تم التعديل
  EditRequested: 2, // طلب تعديل
  NotPassed: 3, // لم يجتاز
  WaitingForSignature: 4, // في إنتظار التوقيع
  Completed: 5, // إكتمل
} as const;

export type StudentApplicationStatus =
  (typeof StudentApplicationStatus)[keyof typeof StudentApplicationStatus];

export interface StudentApplicationDto {
  id: string;
  studentId: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  lkSchoolStageId: string | null;
  lkSchoolStageNameAr: string | null;
  lkSchoolStageNameEn: string | null;
  status: StudentApplicationStatus;
  educationalCustodyPath: string | null;
  hasPreviousSchool: boolean;
  previousSchoolName: string | null;
  studentPhotoPath: string | null;
  guardianIdentityPath: string | null;
  vaccinationCertificatePath: string | null;
  lastEducationCertificatePath: string | null;
  created: string;
}

export interface StudentApplicationListResponse {
  applicationDtos: StudentApplicationDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentApplicationQueryParams {
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  Status?: number;
  LKSchoolStageId?: string;
}
