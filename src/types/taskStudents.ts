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