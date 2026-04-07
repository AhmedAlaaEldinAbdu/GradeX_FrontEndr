import { mixed, number, object, string, type InferType } from 'yup';

const CORRECTION_TYPES = [1, 2] as const;
const EVALUATION_GRADES = [1, 2, 3, 4] as const;

const baseTaskCorrectionSchema = {
  taskStudentId: string()
    .required('taskCorrections.validation.taskStudentRequired')
    .typeError('taskCorrections.validation.taskStudentRequired'),
  correctionType: number()
    .required('taskCorrections.validation.correctionTypeRequired')
    .oneOf([...CORRECTION_TYPES], 'taskCorrections.validation.correctionTypeRequired')
    .typeError('taskCorrections.validation.correctionTypeRequired'),
  studentScore: number().when('correctionType', {
    is: 1,
    then: (schema) =>
      schema
        .required('taskCorrections.validation.studentScoreRequired')
        .min(0, 'taskCorrections.validation.studentScoreMin')
        .typeError('taskCorrections.validation.studentScoreRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  maxScore: number().when('correctionType', {
    is: 1,
    then: (schema) =>
      schema
        .required('taskCorrections.validation.maxScoreRequired')
        .moreThan(0, 'taskCorrections.validation.maxScorePositive')
        .typeError('taskCorrections.validation.maxScoreRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  evaluationGrade: number().when('correctionType', {
    is: 2,
    then: (schema) =>
      schema
        .required('taskCorrections.validation.evaluationGradeRequired')
        .oneOf([...EVALUATION_GRADES], 'taskCorrections.validation.evaluationGradeRequired')
        .typeError('taskCorrections.validation.evaluationGradeRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  feedback: string().optional(),
  attachment: mixed<File[]>().optional(),
};

export const AddTaskCorrectionSchema = object(baseTaskCorrectionSchema).test(
  'student-score-not-greater-than-max-score',
  'taskCorrections.validation.studentScoreNotGreaterThanMax',
  (value) => {
    if (!value || value.correctionType !== 1) {
      return true;
    }

    if (value.studentScore === undefined || value.maxScore === undefined) {
      return true;
    }

    return value.studentScore <= value.maxScore;
  }
);

export const EditTaskCorrectionSchema = object({
  id: string()
    .required('taskCorrections.validation.idRequired')
    .typeError('taskCorrections.validation.idRequired'),
  ...baseTaskCorrectionSchema,
}).test(
  'student-score-not-greater-than-max-score',
  'taskCorrections.validation.studentScoreNotGreaterThanMax',
  (value) => {
    if (!value || value.correctionType !== 1) {
      return true;
    }

    if (value.studentScore === undefined || value.maxScore === undefined) {
      return true;
    }

    return value.studentScore <= value.maxScore;
  }
);

export type AddTaskCorrectionProps = InferType<typeof AddTaskCorrectionSchema>;
export type EditTaskCorrectionProps = InferType<typeof EditTaskCorrectionSchema>;