export const StudentApplicationStatus = {
  Accept: 1, // مقبول
  Reject: 2, // مرفوض
  Pending: 3, // قيد المراجعة
  EditRequest: 4, // طلب تعديل
  Edited: 5, // تم التعديل
  InterviewScheduled: 6, // تم تحديد مقابلة
  Cancelled: 7, // ملغي
  Archived: 8, // مؤرشف
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

export interface StudentApplicationStatusCount {
  status: StudentApplicationStatus;
  count: number;
}

export interface StudentApplicationListResponse {
  applicationDtos: StudentApplicationDto[];
  totalApplications: number;
  statusCounts: StudentApplicationStatusCount[];
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
  SchoolBranchesId?: string;
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
  phoneNumber: string | null;
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

export interface StudentApplicationInterviewDto {
  interviewDate: string | null;
  startTime: string | null;
  endTime: string | null;
}

export interface BookItem {
  id: string;
  name: string;
  code?: string | null;
  price?: number | null;
  fileName?: string | null;
  filePath?: string | null;
}

export interface StudentApplicationDetailDto {
  id: string;
  studentId: string;
  firstName: string;
  secondName: string;
  thirdName: string;
  fourthName: string;
  dateOfBirth: string;
  identityType?: number;
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
  paidServicesTotal?: number | null;
  books?: BookItem[];
  booksTotal?: number | null;
  subTotal?: number | null;
  total: number | null;
  discountTotal: number | null;
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
  interviewDto?: StudentApplicationInterviewDto | null;
  editRequest?: string | null;
  classroomid?: string | null;
  nationalityId?: string | null;
  nationalityName?: string | null;
  createdDate?: string | null;
  fatherName?: string | null;
  fatherIdentityPath?: string | null;
  fatherEducationalCertificatePath?: string | null;
  motherName?: string | null;
  motherIdentityPath?: string | null;
  motherEducationalCertificatePath?: string | null;
  familyCardPath?: string | null;
  parentInfo: ParentInfo;
}
