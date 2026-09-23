export const SchoolTaskType = {
  Type1: 1,
  Type2: 2,
  Type3: 3,
  Type4: 4,
  Type5: 5,
  Type6: 6,
} as const;

export type SchoolTaskType = (typeof SchoolTaskType)[keyof typeof SchoolTaskType];

export const SchoolTaskSubmissionStatus = {
  Status1: 1,
  Status2: 2,
  Status3: 3,
  Status4: 4,
} as const;

export type SchoolTaskSubmissionStatus =
  (typeof SchoolTaskSubmissionStatus)[keyof typeof SchoolTaskSubmissionStatus];

export interface SchoolTask {
  id: string;
  gradeId: string;
  gradeName: string;
  classroomId: string;
  classroomName: string;
  materialId: string;
  materialName: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  taskType: SchoolTaskType;
  date: string;
  deliveryDate: string;
  startPageNumber: number;
  endPageNumber: number;
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  assignmentType: number;
  attachmentUrls: string[];
  teatcherName: string;
  schoolBranchesId: string;
  totalTaskNumber: number;
  correctTaskNumber: number;
  studentIds?: string[];
}

export interface SchoolTaskStatusItem {
  id?: string;
  studentId?: string;
  studentName?: string;
  submissionStatus?: SchoolTaskSubmissionStatus;
  [key: string]: unknown;
}

export interface StudentSchoolTask extends SchoolTask {
  studentId?: string;
  submissionStatus?: SchoolTaskSubmissionStatus;
}

export interface SchoolTaskListData {
  schoolTaskDto: SchoolTask[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface SchoolTaskListResponse {
  data: SchoolTaskListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface SchoolTaskStatusListData {
  taskStatuses: SchoolTaskStatusItem[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface SchoolTaskStatusListResponse {
  data: SchoolTaskStatusListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface StudentSchoolTaskListData {
  schoolTasks: StudentSchoolTask[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface StudentSchoolTaskListResponse {
  data: StudentSchoolTaskListData;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface SchoolTaskDetailResponse {
  data: SchoolTask | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface SchoolTaskMutationResponse {
  data: SchoolTask | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface SchoolTaskQueryParams {
  PageIndex?: number;
  PageSize?: number;
  ClassroomId?: string;
  MaterialId?: string;
  TaskType?: SchoolTaskType;
  SchoolBranchesId?: string;
}

export interface SchoolTaskStatusQueryParams {
  Id: string;
  PageIndex?: number;
  PageSize?: number;
  StudentName?: string;
  SubmissionStatus?: SchoolTaskSubmissionStatus;
}

export interface StudentSchoolTaskQueryParams {
  PageIndex?: number;
  PageSize?: number;
  StudentId?: string;
  Date?: string;
  SubmissionStatus?: SchoolTaskSubmissionStatus;
  MaterialId?: string;
  TaskType?: SchoolTaskType;
}

export interface CreateSchoolTaskRequest {
  schoolBranchesId: string;
  gradeId: string;
  classroomId: string;
  materialId: string;
  nameAr: string;
  nameEn: string;
  taskType: SchoolTaskType;
  date: string;
  deliveryDate: string;
  startPageNumber: number;
  endPageNumber: number;
  descriptionAr?: string;
  descriptionEn?: string;
  assignmentType: number;
  attachment?: File[];
  studentIds?: string[];
}

export interface UpdateSchoolTaskRequest extends CreateSchoolTaskRequest {
  id: string;
}
