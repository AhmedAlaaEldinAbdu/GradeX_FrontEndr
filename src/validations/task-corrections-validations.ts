import { mixed, number, object, string, type InferType } from 'yup';

const CORRECTION_TYPES = [1, 2] as const;
const EVALUATION_GRADES = [1, 2, 3, 4] as const;

const baseTaskCorrectionSchema = {
  taskStudentId: string()
    .required('Task student is required')
    .typeError('Task student is required'),
  correctionType: number()
    .required('Correction type is required')
    .oneOf([...CORRECTION_TYPES], 'Correction type is required')
    .typeError('Correction type is required'),
  studentScore: number().when('correctionType', {
    is: 1,
    then: (schema) =>
      schema
        .required('Student grade is required')
        .min(0, 'Student grade must be zero or greater')
        .typeError('Student grade is required'),
    otherwise: (schema) => schema.optional(),
  }),
  maxScore: number().when('correctionType', {
    is: 1,
    then: (schema) =>
      schema
        .required('Training grade is required')
        .moreThan(0, 'Training grade must be greater than zero')
        .typeError('Training grade is required'),
    otherwise: (schema) => schema.optional(),
  }),
  evaluationGrade: number().when('correctionType', {
    is: 2,
    then: (schema) =>
      schema
        .required('Student performance is required')
        .oneOf([...EVALUATION_GRADES], 'Student performance is required')
        .typeError('Student performance is required'),
    otherwise: (schema) => schema.optional(),
  }),
  feedback: string().optional(),
  attachment: mixed<File[]>().optional(),
};

export const AddTaskCorrectionSchema = object(baseTaskCorrectionSchema).test(
  'student-score-not-greater-than-max-score',
  'Student grade must be less than or equal to training grade',
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
    .required('Correction id is required')
    .typeError('Correction id is required'),
  ...baseTaskCorrectionSchema,
}).test(
  'student-score-not-greater-than-max-score',
  'Student grade must be less than or equal to training grade',
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