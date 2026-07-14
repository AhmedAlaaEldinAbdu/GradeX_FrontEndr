/**
 * Students Types
 * Defines API contracts for students endpoints.
 */

export interface StudentAttachment {
  id: string;
  name: string;
  nameEn?: string | null;
  size?: string | null;
  filePath?: string | null;
}

export interface StudentDto {
  id: string;
  name: string;
  firstName: string;
  secondName: string;
  thirdName: string | null;
  fourthName: string | null;
  lkCountryId: string | null;
  lKCountries: string | null;
  dateOfBirth: string | null;
  hasDisability: boolean;
  disabilityType: string | null;
  motherNumber: string | null;
  motherCountryCode: string | null;
  emergencyNumber: string | null;
  emergencyCountryCode: string | null;
  image?: string | null;
  profilePicture: string | null;
  schoolBrancheId: string | null;
  schoolBranches: string | null;
  gradeId: string | null;
  grade: string | null;
  className: string | null;
  parentId: string | null;
  parentNationalId: string | null;
  studentNationalId: string | null;
  nationalityId: string | null;
  nationality: string | null;
  isAssignToClassroom: boolean;
  hasAnotherNationality: boolean | null;
  attachments?: StudentAttachment[] | null;
}

export interface StudentListData {
  studentDto: StudentDto[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentListResponse {
  data: StudentListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: Record<string, string[]> | null;
}

export interface StudentQueryParams {
  PageIndex?: number;
  PageSize?: number;
  StudentName?: string;
  SchoolBranchId?: string;
  SchoolBrancheId?: string; // TODO: temp fix for inconsistent API param name, should be removed once API is fixed
  GradeId?: string;
  ClassroomId?: string;
  Createby?: string;
  Date?: string;
}

// Helper to get full name from student DTO
export function getStudentFullName(student: StudentDto): string {
  const parts = [
    student.firstName,
    student.secondName,
    student.thirdName,
    student.fourthName,
  ].filter(Boolean);
  return parts.join(' ');
}
