import type { ExamSource, ExamDifficulty } from './OnlineExamCard';

export type ExamDetailsItem = {
  id: string;
  /** Short name shown in the header and breadcrumb (e.g. "أختبار الرياضيات"). */
  name: string;
  source: ExamSource;
  difficulty: ExamDifficulty;
  fullTitle: string;
  fullTitleSuffix?: string;
  titleDirection?: 'rtl' | 'ltr';
  stage: string;
  date: string;
  time: string;
  successRate: number;
  avgTimeMinutes: number;
  questionsCount: number;
  /** e.g. "45/50". */
  attendance: string;
};

export type ResultBucket = {
  range: string;
  studentsCount: number;
  /** Filled width of the bar, 0–100. */
  percent: number;
  color: string;
};

export type ExamQuestionItem = {
  id: string;
  number: number;
  difficulty: ExamDifficulty;
  text: string;
  /** Success rate shown in the ring, 0–100. */
  successRate: number;
  correctCount: number;
  wrongCount: number;
  avgSeconds: number;
};

// Mock data — replaced by the API once the LMS integration is wired up.
export const EXAM_DETAILS: ExamDetailsItem = {
  id: '1',
  name: 'أختبار الرياضيات',
  source: 'questionBank',
  difficulty: 'hard',
  fullTitle: 'اختبار الرياضيات - الفصل الثالث',
  stage: 'المرحلة الاعدادية - الصف الأول',
  date: '22/4/2024',
  time: '2:00 مساءا',
  successRate: 78,
  avgTimeMinutes: 25,
  questionsCount: 20,
  attendance: '45/50',
};

export type StudentGrade = 'A+' | 'B' | 'C' | 'D';

export type ExamStudentItem = {
  id: string;
  name: string;
  /** null when the student has not been graded yet. */
  grade: StudentGrade | null;
  score: number | null;
  timeMinutes: number;
};

export type ReviewSummary = {
  studentName: string;
  grade: StudentGrade;
  successRate: number;
  avgTimeMinutes: number;
  answeredCount: number;
  questionsCount: number;
};

export type ReviewAnswerItem = {
  id: string;
  number: number;
  question: string;
  isCorrect: boolean;
  answer: string;
  timeSeconds: number;
};

// Mock data — replaced by the API once the LMS integration is wired up.
export const REVIEW_SUMMARY: ReviewSummary = {
  studentName: 'أحمد معتز حسن',
  grade: 'A+',
  successRate: 78,
  avgTimeMinutes: 25,
  answeredCount: 15,
  questionsCount: 20,
};

export const REVIEW_ANSWERS: ReviewAnswerItem[] = [
  {
    id: '1',
    number: 1,
    question: 'ما هو ناتج ضرب ٧ × ٨؟',
    isCorrect: true,
    answer: '35',
    timeSeconds: 24,
  },
  {
    id: '2',
    number: 2,
    question: 'ما هو ناتج ضرب ٧ × ٨؟',
    isCorrect: true,
    answer: '35',
    timeSeconds: 24,
  },
  {
    id: '3',
    number: 3,
    question: 'ما هو ناتج ضرب ٧ × ٨؟',
    isCorrect: true,
    answer: '35',
    timeSeconds: 24,
  },
  {
    id: '4',
    number: 4,
    question: 'ما هو ناتج ضرب ٧ × ٨؟',
    isCorrect: false,
    answer: '35',
    timeSeconds: 24,
  },
  {
    id: '5',
    number: 5,
    question: 'ما هو ناتج ضرب ٧ × ٨؟',
    isCorrect: false,
    answer: '35',
    timeSeconds: 24,
  },
];

export const EXAM_STUDENTS: ExamStudentItem[] = [
  { id: '1', name: 'أحمد معتز حسن', grade: 'A+', score: 89, timeMinutes: 38 },
  { id: '2', name: 'أحمد معتز حسن', grade: 'D', score: 32, timeMinutes: 38 },
  { id: '3', name: 'أحمد معتز حسن', grade: 'B', score: 78, timeMinutes: 38 },
  { id: '4', name: 'أحمد معتز حسن', grade: null, score: null, timeMinutes: 38 },
  { id: '5', name: 'أحمد معتز حسن', grade: 'C', score: 57, timeMinutes: 38 },
  { id: '6', name: 'أحمد معتز حسن', grade: 'D', score: 32, timeMinutes: 38 },
];

export const EXAM_QUESTIONS: ExamQuestionItem[] = [
  {
    id: '1',
    number: 1,
    difficulty: 'easy',
    text: 'ما هو ناتج ضرب ٧ × ٨؟',
    successRate: 85,
    correctCount: 35,
    wrongCount: 7,
    avgSeconds: 24,
  },
  {
    id: '2',
    number: 2,
    difficulty: 'hard',
    text: 'ما هو ناتج ضرب ٧ × ٨؟',
    successRate: 24,
    correctCount: 35,
    wrongCount: 7,
    avgSeconds: 24,
  },
  {
    id: '3',
    number: 3,
    difficulty: 'medium',
    text: 'ما هو ناتج ضرب ٧ × ٨؟',
    successRate: 45,
    correctCount: 35,
    wrongCount: 7,
    avgSeconds: 24,
  },
];

export const RESULT_DISTRIBUTION: ResultBucket[] = [
  { range: '20 - 29%', studentsCount: 12, percent: 4, color: '#DD0417' },
  { range: '30 - 39%', studentsCount: 12, percent: 23, color: '#DD0417' },
  { range: '40 - 49%', studentsCount: 15, percent: 30, color: '#F8951B' },
  { range: '50 - 59%', studentsCount: 15, percent: 59, color: '#F8951B' },
  { range: '60 - 69%', studentsCount: 12, percent: 75, color: '#117BD7' },
  { range: '70 - 79%', studentsCount: 12, percent: 91, color: '#117BD7' },
  { range: '80 - 89%', studentsCount: 12, percent: 91, color: '#1A9F58' },
  { range: '90 - 100%', studentsCount: 12, percent: 91, color: '#1A9F58' },
];
