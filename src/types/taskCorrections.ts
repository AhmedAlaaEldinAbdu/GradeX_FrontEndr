export const TaskCorrectionType = {
  Grades: 1,
  Evaluation: 2,
} as const;

export type TaskCorrectionType = (typeof TaskCorrectionType)[keyof typeof TaskCorrectionType];

export const TaskCorrectionEvaluationGrade = {
  Excellent: 1,
  VeryGood: 2,
  Good: 3,
  Acceptable: 4,
} as const;

export type TaskCorrectionEvaluationGrade =
  (typeof TaskCorrectionEvaluationGrade)[keyof typeof TaskCorrectionEvaluationGrade];

export interface TaskCorrectionAttachment {
  id?: string;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
}

export interface TaskCorrection {
  id: string;
  taskStudentId: string;
  correctionType: TaskCorrectionType;
  studentScore?: number;
  maxScore?: number;
  evaluationGrade?: TaskCorrectionEvaluationGrade;
  feedback?: string;
  attachmentUrls?: string[];
  attachments?: TaskCorrectionAttachment[];
  createdOn?: string;
  updatedOn?: string;
}

export interface TaskCorrectionResponse {
  data: TaskCorrection | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface TaskCorrectionMutationResponse {
  data: TaskCorrection | null;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

export interface CreateTaskCorrectionRequest {
  taskStudentId: string;
  correctionType: TaskCorrectionType;
  studentScore?: number;
  maxScore?: number;
  evaluationGrade?: TaskCorrectionEvaluationGrade;
  feedback?: string;
  attachment?: File[];
}

export interface UpdateTaskCorrectionRequest extends CreateTaskCorrectionRequest {
  id: string;
}
