import { array, object, string, type InferType } from 'yup';

export const AIExamBasicInfoSchema = object({
  titleAr: string().trim().required('eLearning.onlineExams.addAI.validation.titleArRequired'),
  titleEn: string().trim().required('eLearning.onlineExams.addAI.validation.titleEnRequired'),
  topic: string().required('eLearning.onlineExams.addAI.validation.topicRequired'),
  language: string().required('eLearning.onlineExams.addAI.validation.languageRequired'),
  subject: string().required('eLearning.onlineExams.addAI.validation.subjectRequired'),
  stage: string().required('eLearning.onlineExams.addAI.validation.stageRequired'),
  grades: array()
    .of(string().required())
    .min(1, 'eLearning.onlineExams.addAI.validation.gradeRequired')
    .required('eLearning.onlineExams.addAI.validation.gradeRequired'),
  targetAudience: string().required(
    'eLearning.onlineExams.addAI.validation.targetAudienceRequired'
  ),
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
