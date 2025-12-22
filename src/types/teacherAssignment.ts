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
// Grade (Educational Stage) in Assignment
// ============================================================================

export interface TeacherAssignmentGrade {
  id: string;
  name: string;
  nameEN: string;
  classRooms: TeacherAssignmentClassroom[];
}

// ============================================================================
// Teacher Assignment Data
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
// API Response Types
// ============================================================================

export interface TeacherAssignmentResponse {
  data: TeacherAssignmentData;
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
