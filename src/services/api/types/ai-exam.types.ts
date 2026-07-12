// ============================================================================
// API envelopes
// ============================================================================

export interface AIExamApiEnvelope<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  validationErrors: AIExamValidationError[] | string[] | null;
}

export interface AIExamValidationError {
  propertyName: string;
  errorMessage: string;
}

// ============================================================================
// List exams
// ============================================================================

export const AIExamStatus = {
  Active: 1,
  Scheduled: 2,
} as const;
export type AIExamStatus = (typeof AIExamStatus)[keyof typeof AIExamStatus];

export const AIExamDifficulty = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
} as const;
export type AIExamDifficulty = (typeof AIExamDifficulty)[keyof typeof AIExamDifficulty];

export interface AIExamsListQueryParams {
  SchoolBranchId: string;
  PageNumber?: number;
  PageSize?: number;
  Search?: string;
  MaterialId?: string;
  GradeId?: string;
  Status?: AIExamStatus;
  Difficulty?: AIExamDifficulty;
}

export interface AIExamListItem {
  id: string;
  titleAr: string;
  titleEn: string;
  topic?: string | null;
  materialName?: string | null;
  gradeName?: string | null;
  status: AIExamStatus | number;
  isAIGenerated: boolean;
  difficulty: AIExamDifficulty | number;
  successRate: number;
  durationMinutes: number;
  questionsCount: number;
  totalPoints: number;
  startDate?: string | null;
  endDate?: string | null;
  studentsCount: number;
  submittedCount: number;
  inProgressCount: number;
  notStartedCount: number;
}

export interface AIExamsListData {
  exams: AIExamListItem[];
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export type GetAIExamsResponse = AIExamApiEnvelope<AIExamsListData>;

// ============================================================================
// Question models
// ============================================================================

export type AIExamQuestionType = 'MCQ' | 'TrueFalse' | 'Essay' | string;
export type AIExamQuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | string;

export interface AIExamQuestionPayload {
  text: string;
  type: AIExamQuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
  difficulty: AIExamQuestionDifficulty;
  order: number;
  explanation: string;
}

export interface AIExamGeneratedQuestion extends AIExamQuestionPayload {
  id: string;
}

// ============================================================================
// Generate questions
// ============================================================================

export interface GenerateAIExamQuestionsRequest {
  topic: string;
  language: string;
  questionsCount: number;
  totalPoints: number;
  passingScore: number;
  durationMinutes: number;
  resultVisibility: number;
  isExplainedQuestions: boolean;
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
  questionTypes: AIExamQuestionType[];
}

export type GenerateAIExamQuestionsResponse = AIExamApiEnvelope<AIExamQuestionPayload[]>;

// ============================================================================
// Create AI exam
// ============================================================================

export interface CreateAIExamRequest {
  schoolBrancheId: string;
  titleAr: string;
  titleEn: string;
  topic: string;
  language: number;
  materialId: string;
  gradeId: string;
  startDate: string;
  endDate: string;
  questionsCount: number;
  totalPoints: number;
  passingScore: number;
  durationMinutes: number;
  resultVisibility: number;
  isExplainedQuestions: boolean;
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
  studentSelect: number;
  classroomIds: string[];
  studentIds: string[];
  questions: AIExamQuestionPayload[];
}

export interface AIExamDetails {
  id?: string;
  [key: string]: unknown;
}

export type CreateAIExamResponse = AIExamApiEnvelope<AIExamDetails>;
