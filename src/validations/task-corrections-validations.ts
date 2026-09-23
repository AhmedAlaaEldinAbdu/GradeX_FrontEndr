import { mixed, number, object, string, type InferType } from 'yup';

const CORRECTION_TYPES = [1, 2] as const;
const EVALUATION_GRADES = [1, 2, 3, 4] as const;

const baseTaskCorrectionSchema = {
  taskStudentId: string()
    .required('tasksManagement.correctionValidation.taskStudentRequired')
    .typeError('tasksManagement.correctionValidation.taskStudentRequired'),
  correctionType: number()
    .required('tasksManagement.correctionValidation.correctionTypeRequired')
    .oneOf([...CORRECTION_TYPES], 'tasksManagement.correctionValidation.correctionTypeRequired')
    .typeError('tasksManagement.correctionValidation.correctionTypeRequired'),
  studentScore: number().when('correctionType', {
    is: 1,
    then: (schema) =>
      schema
        .required('tasksManagement.correctionValidation.studentGradeRequired')
        .min(0, 'tasksManagement.correctionValidation.studentGradeMin')
        .typeError('tasksManagement.correctionValidation.studentGradeRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  maxScore: number().when('correctionType', {
    is: 1,
    then: (schema) =>
      schema
        .required('tasksManagement.correctionValidation.trainingGradeRequired')
        .moreThan(0, 'tasksManagement.correctionValidation.trainingGradeGreaterThanZero')
        .typeError('tasksManagement.correctionValidation.trainingGradeRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  evaluationGrade: number().when('correctionType', {
    is: 2,
    then: (schema) =>
      schema
        .required('tasksManagement.correctionValidation.studentPerformanceRequired')
        .oneOf(
          [...EVALUATION_GRADES],
          'tasksManagement.correctionValidation.studentPerformanceRequired'
        )
        .typeError('tasksManagement.correctionValidation.studentPerformanceRequired'),
    otherwise: (schema) => schema.optional(),
  }),
  feedback: string().optional(),
  attachment: mixed<File[]>().optional(),
};

export const AddTaskCorrectionSchema = object(baseTaskCorrectionSchema).test(
  'student-score-not-greater-than-max-score',
  'tasksManagement.correctionValidation.studentGradeLessThanOrEqualTrainingGrade',
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
    .required('tasksManagement.correctionValidation.correctionIdRequired')
    .typeError('tasksManagement.correctionValidation.correctionIdRequired'),
  ...baseTaskCorrectionSchema,
}).test(
  'student-score-not-greater-than-max-score',
  'tasksManagement.correctionValidation.studentGradeLessThanOrEqualTrainingGrade',
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
