// ============================================================================
// API envelopes
// ============================================================================

export interface AIExamApiEnvelope<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  validationErrors: string[] | null;
}

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
