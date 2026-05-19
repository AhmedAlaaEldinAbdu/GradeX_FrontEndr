export interface TaskStudentAttachment {
  id?: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
}

export interface TaskStudent {
  id: string;
  taskId?: string;
  studentId?: string;
  studentNameAr?: string;
  studentNameEn?: string;
  classroomAr?: string;
  classroomEn?: string;
  taskNameAr?: string;
  taskNameEn?: string;
  materialId?: string;
  materialName?: string;
  taskDate?: string;
  deliveryDate?: string;
  submissionDate?: string;
  attachmentUrls?: string[];
  attachments?: TaskStudentAttachment[];
  [key: string]: unknown;
}

export interface TaskStudentResponse {
  data: TaskStudent | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface TaskStudentMutationResponse {
  data: TaskStudent | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface StudentMaterialTaskListData {
  taskStudents: TaskStudent[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentMaterialTaskListResponse {
  data: StudentMaterialTaskListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface StudentMaterialTasksQueryParams {
  taskDate?: string;
}

export interface UpdateTaskStudentRequest {
  id: string;
  attachment?: File[];
}

// ============================================================================
// Student Exams (GET /api/TaskStudent/Exams/{studentId})
// ============================================================================

export interface StudentExamItem {
  nameAr: string;
  nameEn: string;
  materialId: string;
  materialNameAr: string;
  materialNameEn: string;
  date: string;
  taskType: number;
  deliveryDate: string;
  correctionType: number | null;
  evaluationGrade: number | null;
  studentScore: number | null;
  maxScore: number | null;
}

export interface StudentExamsListData {
  exams: StudentExamItem[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentExamsListResponse {
  data: StudentExamsListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface StudentExamsQueryParams {
  PageSize?: number;
  PageIndex?: number;
  Search?: string;
  Date?: string;
  TaskType?: number; // 4, 5, 6
  EvaluationGrade?: number; // 1-5
}

// ============================================================================
// Student Homework (GET /api/TaskStudent/HomeWork/{studentId})
// ============================================================================

export interface StudentHomeworkItem {
  nameAr: string;
  nameEn: string;
  materialId: string;
  materialNameAr: string;
  materialNameEn: string;
  date: string;
  deliveryDate: string;
  correctionType: number | null;
  evaluationGrade: number | null;
  studentScore: number | null;
  maxScore: number | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  schoolTaskAttachment: string[];
  taskSubmissionAttachment: string[];
}

export interface StudentHomeworkListData {
  exams: StudentHomeworkItem[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentHomeworkListResponse {
  data: StudentHomeworkListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface StudentHomeworkQueryParams {
  PageSize?: number;
  PageIndex?: number;
  Search?: string;
  Date?: string;
  EvaluationGrade?: number; // 1-5
}