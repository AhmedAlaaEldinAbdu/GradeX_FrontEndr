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

export interface CreateLessonRequest {
  materialId: string;
  teacherId: string;
  bookId: string;
  classworkFromPage: number;
  classworkToPage: number;
  homeworkFromPage: number;
  homeworkToPage: number;
  homeworkDescriptionAr?: string;
  homeworkDescriptionEn?: string;
  startTime: string;
  endTime: string;
  date: string;
  gradeId: string;
  classroomId: string;
  isHomeworkForAllStudents: boolean;
  studentIds?: string[];
  attachments?: File[];
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {
  id: string;
}
