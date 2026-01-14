/**
 * Lessons Types
 * Defines API contracts for lessons endpoints.
 */

export interface LessonStudent {
  id: string;
  studentId: string;
  studentName?: string;
}

export interface LessonAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
}

export interface Lesson {
  id: string;
  materialId: string;
  materialNameAr: string;
  materialNameEn: string | null;
  teacherId: string;
  teacherName: string;
  bookId: string;
  bookName: string;
  schoolBranchesId: string;
  classworkFromPage: number;
  classworkToPage: number;
  homeworkFromPage: number;
  homeworkToPage: number;
  homeworkDescriptionAr: string | null;
  homeworkDescriptionEn: string | null;
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  date: string; // ISO date string
  gradeId: string;
  gradeNameAr: string;
  gradeNameEn: string;
  classroomId: string;
  classroomNameAr: string;
  classroomNameEn: string | null;
  isHomeworkForAllStudents: boolean;
  lessonsStudent: LessonStudent[];
  attachments: LessonAttachment[];
}

export interface LessonsListData {
  lessons: Lesson[];
}

export interface LessonsListResponse {
  data: LessonsListData | null;
  isSuccess: boolean;
  message: string;
  validationErrors: Record<string, string[]> | null;
}

export interface LessonsQueryParams {
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  GradeId?: string;
  ClassroomId?: string;
  MaterialId?: string;
  TeacherId?: string;
  Date?: string;
  FromDate?: string;
  ToDate?: string;
}

/**
 * Attachment structure for lesson file uploads
 */
export interface LessonAttachmentInput {
  fileName: string;
  oldFile?: string;
  fileUrl?: string;
}

/**
 * Create lesson request payload - matches API multipart/form-data format
 * Note: The API expects form-data with PascalCase field names
 */
export interface CreateLessonRequest {
  studentId?: string;
  materialId: string;
  classworkFromPage: number;
  bookId: string;
  endTime: string;
  homeworkFromPage: number;
  isHomeworkForAllStudents: boolean;
  classroomId: string;
  date: string;
  startTime: string;
  attachments?: LessonAttachmentInput;
  gradeId: string;
  classworkToPage: number;
  homeworkDescriptionEn?: string;
  homeworkToPage: number;
  teacherId: string;
  homeworkDescriptionAr?: string;
  schoolBranchesId: string;
}

/**
 * Form data used internally before converting to API request
 */
export interface LessonFormValues {
  materialId: string;
  teacherId: string;
  bookId: string;
  classworkFromPage: string;
  classworkToPage: string;
  homeworkFromPage: string;
  homeworkToPage: string;
  homeworkDescriptionAr: string;
  homeworkDescriptionEn: string;
  gradeId: string;
  classroomId: string;
  startTime: string;
  endTime: string;
  date: string;
  isHomeworkForAllStudents: boolean;
  studentIds: string[];
  schoolBranchesId: string;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {
  id: string;
}
