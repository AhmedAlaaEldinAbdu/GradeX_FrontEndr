export const StudentApplicationStatus = {
  Accept: 1, // مقبول
  Reject: 2, // مرفوض
  Pending: 3, // قيد المراجعة
  EditRequest: 4, // طلب تعديل
  Edited: 5, // تم التعديل
  InterviewScheduled: 6, // تم تحديد مقابلة
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

export const RelationshipType = {
  Father: 1,
  Mother: 2,
  Uncle: 3,
  Aunt: 4,
  Other: 5,
} as const;

export type RelationshipType = (typeof RelationshipType)[keyof typeof RelationshipType];

export interface ParentInfo {
  parentId: string;
  email: string;
  lkCountryId: string;
  lkCountryName: string | null;
  cityId: string | null;
  cityName: string | null;
  districtName: string | null;
  streetName: string | null;
  buildingNumber: string | null;
}

export interface PaidService {
  id: string;
  name: string;
  amount: number;
}

export interface StudentApplicationDetailDto {
  id: string;
  studentId: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  dateOfBirth: string;
  lkSchoolStageId: string;
  lkSchoolStageName: string | null;
  gradeId: string;
  gradeName: string;
  tuitionFeesId: string;
  tuitionAmount: number;
  services: string[];
  schoolBrancheId: string;
  schoolName: string;
  lKPaymentMethodId: string;
  paymentMethod: string;
  installmentPlanId: string | null;
  offers: string[];
  paidServices: PaidService[];
  total: number;
  status: StudentApplicationStatus;
  guardianName: string;
  relationshipType: RelationshipType;
  educationalCustodyPath: string | null;
  hasPreviousSchool: boolean;
  previousSchoolName: string | null;
  studentPhotoPath: string | null;
  guardianIdentityPath: string | null;
  vaccinationCertificatePath: string | null;
  lastEducationCertificatePath: string | null;
  interviewDate?: string | null;
  parentInfo: ParentInfo;
}
