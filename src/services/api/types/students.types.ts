/**
 * Students Types
 * Defines API contracts for students endpoints.
 */

export interface StudentDto {
  id: string;
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
  profilePicture: string | null;
  schoolBrancheId: string | null;
  schoolBranches: string | null;
  gradeId: string | null;
  grade: string | null;
  className: string | null;
  parentId: string | null;
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
  Search?: string;
  SchoolBranchId?: string;
  SchoolBrancheId?: string; // TODO: temp fix for inconsistent API param name, should be removed once API is fixed
  GradeId?: string;
  ClassroomId?: string;
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
