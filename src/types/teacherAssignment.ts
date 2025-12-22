/**
 * Teacher Assignment Types
 * Types for teacher educational stages and classrooms assignment
 */

// ============================================================================
// Classroom in Assignment
// ============================================================================

export interface TeacherAssignmentClassroom {
  id: string;
  name: string;
  nameEN: string;
}

// ============================================================================
// Classroom in List Assignment
// ============================================================================

export interface TeacherAssignmentListClassroom {
  id: string;
  nameAR: string;
  nameEN: string | null;
}

// ============================================================================
// Book in List Assignment
// ============================================================================

export interface TeacherAssignmentBook {
  id: string;
  name: string;
}

// ============================================================================
// Grade (Educational Stage) in Assignment
// ============================================================================

export interface TeacherAssignmentGrade {
  id: string;
  name: string;
  nameEN: string;
  classRooms: TeacherAssignmentClassroom[];
}

// ============================================================================
// Teacher Assignment Data (for single teacher details)
// ============================================================================

export interface TeacherAssignmentData {
  gradeCount: number;
  classRoomCount: number;
  studentCount: number;
  materailCount: number; // Note: API has typo "materail" instead of "material"
  bookCount: number;
  grades: TeacherAssignmentGrade[];
}

// ============================================================================
// Teacher Assignment List Item (for teacher list)
// ============================================================================

export interface TeacherAssignmentListItem {
  schoolBranchesId: string;
  id: string;
  teacherId: string;
  teacherName: string;
  countryCode: string;
  phone: string;
  email: string;
  gradeId: string;
  gradeNameAR: string;
  gradeNameEN: string | null;
  materialId: string;
  materialNameAR: string;
  materialNameEN: string | null;
  classrooms: TeacherAssignmentListClassroom[];
  books: TeacherAssignmentBook[];
}

// ============================================================================
// Teacher Assignment List Data
// ============================================================================

export interface TeacherAssignmentListData {
  teacherAssignmentDto: TeacherAssignmentListItem[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface TeacherAssignmentResponse {
  data: TeacherAssignmentData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface TeacherAssignmentListResponse {
  data: TeacherAssignmentListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface TeacherAssignmentQueryParams {
  TeacherId: string;
}

export interface TeacherAssignmentListQueryParams {
  SchoolBranchesId: string;
  PageIndex?: number;
  PageSize?: number;
}
