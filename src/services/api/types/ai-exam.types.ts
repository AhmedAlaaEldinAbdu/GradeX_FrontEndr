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
// Dashboard stats
// ============================================================================

export interface AIExamDashboardStatsQueryParams {
  SchoolBranchId: string;
}

export interface AIExamDashboardStats {
  successRate: number;
  activeExamsCount: number;
}

export type GetAIExamDashboardStatsResponse = AIExamApiEnvelope<AIExamDashboardStats>;

// ============================================================================
// Exam details
// ============================================================================

export interface AIExamDetailsQueryParams {
  ExamId: string;
}

export interface AIExamSummary {
  examId: string;
  titleAr: string;
  titleEn: string;
  topic?: string | null;
  status: AIExamStatus | number;
  difficulty: AIExamDifficulty | number;
  isAIGenerated: boolean;
  gradeName?: string | null;
  stageName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  successRate: number;
  averageTimeMinutes: number;
  questionsCount: number;
  attendedCount: number;
  assignedCount: number;
  comparedToPreviousExamPercentage?: number | null;
}

export interface AIExamQuestionStats {
  questionId: string;
  order: number;
  text: string;
  difficulty: AIExamDifficulty | number;
  successRate: number;
  averageTimeSeconds: number;
  correctAnswersCount: number;
  wrongAnswersCount: number;
}

export interface AIExamResultsDistributionBucket {
  rangeFrom: number;
  rangeTo: number;
  studentsCount: number;
}

export type GetAIExamSummaryResponse = AIExamApiEnvelope<AIExamSummary | null>;
export type GetAIExamQuestionsStatsResponse = AIExamApiEnvelope<AIExamQuestionStats[]>;
export type GetAIExamResultsDistributionResponse = AIExamApiEnvelope<
  AIExamResultsDistributionBucket[]
>;

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
