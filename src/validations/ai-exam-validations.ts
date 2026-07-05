import { array, boolean, number, object, string, type InferType } from 'yup';

export const AIExamBasicInfoSchema = object({
  titleAr: string().trim().required('eLearning.onlineExams.addAI.validation.titleArRequired'),
  titleEn: string().trim().required('eLearning.onlineExams.addAI.validation.titleEnRequired'),
  topic: string().required('eLearning.onlineExams.addAI.validation.topicRequired'),
  language: string().required('eLearning.onlineExams.addAI.validation.languageRequired'),
  subject: string().required('eLearning.onlineExams.addAI.validation.subjectRequired'),
  academicSystem: string().required('grades.validation.academicSystemRequired'),
  grades: array()
    .of(string().required())
    .min(1, 'requests.addMessage.validation.gradesRequired')
    .required('requests.addMessage.validation.gradesRequired'),
  classrooms: array()
    .of(string().required())
    .min(1, 'requests.addMessage.validation.classroomsRequired')
    .required('requests.addMessage.validation.classroomsRequired'),
  targetAudience: string().required(
    'eLearning.onlineExams.addAI.validation.targetAudienceRequired'
  ),
  studentIds: array().of(string().required()).default([]),
  startDate: string().required('eLearning.onlineExams.addAI.validation.startDateRequired'),
  endDate: string().default(''),
  passingGrade: string()
    .required('eLearning.onlineExams.addAI.validation.passingGradeRequired')
    .test('range', 'eLearning.onlineExams.addAI.validation.passingGradeRange', (value) => {
      if (!value) return false;
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0 && num <= 100;
    }),
  duration: string().default(''),
});

export type AIExamBasicInfoProps = InferType<typeof AIExamBasicInfoSchema>;

export const AIExamQuestionsSchema = object({
  numberOfQuestions: string().required(
    'eLearning.onlineExams.addAI.validation.numberOfQuestionsRequired'
  ),
  totalPoints: string().required('eLearning.onlineExams.addAI.validation.totalPointsRequired'),
  resultVisibility: string().required(
    'eLearning.onlineExams.addAI.validation.resultVisibilityRequired'
  ),
  difficultyEasy: number().min(0).max(100).default(0),
  difficultyMedium: number().min(0).max(100).default(0),
  difficultyHard: number().min(0).max(100).default(0),
  generateExplanation: boolean().default(false),
});

/** Full wizard schema (basic info + questions) used by the form resolver. */
export const AIExamSchema = AIExamBasicInfoSchema.concat(AIExamQuestionsSchema);

export type AIExamQuestionsProps = InferType<typeof AIExamQuestionsSchema>;
export type AIExamProps = InferType<typeof AIExamSchema>;
