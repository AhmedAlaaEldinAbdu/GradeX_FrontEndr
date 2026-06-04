import { array, object, string, type InferType } from 'yup';

export const QuestionBankBasicInfoSchema = object({
  titleAr: string()
    .trim()
    .required('eLearning.onlineExams.addQuestionBank.validation.titleArRequired'),
  titleEn: string()
    .trim()
    .required('eLearning.onlineExams.addQuestionBank.validation.titleEnRequired'),
  subject: string().required('eLearning.onlineExams.addQuestionBank.validation.subjectRequired'),
  stage: string().required('eLearning.onlineExams.addQuestionBank.validation.stageRequired'),
  grades: array()
    .of(string().required())
    .min(1, 'eLearning.onlineExams.addQuestionBank.validation.gradeRequired')
    .required('eLearning.onlineExams.addQuestionBank.validation.gradeRequired'),
  targetAudience: string().required(
    'eLearning.onlineExams.addQuestionBank.validation.targetAudienceRequired'
  ),
  startDate: string().required(
    'eLearning.onlineExams.addQuestionBank.validation.startDateRequired'
  ),
  endDate: string().default(''),
  totalPoints: string().required(
    'eLearning.onlineExams.addQuestionBank.validation.totalPointsRequired'
  ),
  duration: string().default(''),
  passingGrade: string()
    .required('eLearning.onlineExams.addQuestionBank.validation.passingGradeRequired')
    .test(
      'range',
      'eLearning.onlineExams.addQuestionBank.validation.passingGradeRange',
      (value) => {
        if (!value) return false;
        const num = Number(value);
        return !Number.isNaN(num) && num >= 0 && num <= 100;
      }
    ),
  resultVisibility: string().required(
    'eLearning.onlineExams.addQuestionBank.validation.resultVisibilityRequired'
  ),
});

export type QuestionBankBasicInfoProps = InferType<typeof QuestionBankBasicInfoSchema>;

/** Full wizard schema. Later steps (questions/review) will be concatenated here. */
export const QuestionBankExamSchema = QuestionBankBasicInfoSchema;

export type QuestionBankExamProps = InferType<typeof QuestionBankExamSchema>;
