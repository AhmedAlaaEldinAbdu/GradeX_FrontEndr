import { array, mixed, number, object, string, type InferType } from 'yup';

const ARABIC_TEXT_REGEX = /^[\u0600-\u06FF\s\d\p{P}]+$/u;
const ENGLISH_TEXT_REGEX = /^[a-zA-Z\s\d\p{P}]+$/u;
const SCHOOL_TASK_TYPES = [1, 2, 3, 4, 5, 6] as const;

const baseSchoolTaskSchema = {
  schoolBranchesId: string()
    .required('School branch is required')
    .typeError('School branch is required'),
  gradeId: string()
    .required('Educational stage is required')
    .typeError('Educational stage is required'),
  classroomId: string()
    .required('Classroom is required')
    .typeError('Classroom is required'),
  materialId: string()
    .required('Subject is required')
    .typeError('Subject is required'),
  nameAr: string()
    .required('Arabic task name is required')
    .typeError('Arabic task name is required')
    .matches(ARABIC_TEXT_REGEX, 'Arabic task name is invalid'),
  nameEn: string()
    .required('English task name is required')
    .typeError('English task name is required')
    .matches(ENGLISH_TEXT_REGEX, 'English task name is invalid'),
  taskType: number()
    .required('Task type is required')
    .oneOf([...SCHOOL_TASK_TYPES], 'Task type is required')
    .typeError('Task type is required'),
  date: string()
    .required('Task date is required')
    .typeError('Task date is required'),
  deliveryDate: string()
    .required('Delivery date is required')
    .typeError('Delivery date is required'),
  startPageNumber: number()
    .required('Start page is required')
    .integer('Start page must be a whole number')
    .min(0, 'Start page must be at least 0')
    .typeError('Start page is required'),
  endPageNumber: number()
    .required('End page is required')
    .integer('End page must be a whole number')
    .min(0, 'End page must be at least 0')
    .typeError('End page is required')
    .test(
      'end-page-greater-than-start-page',
      'End page must be greater than or equal to start page',
      function validateEndPage(value) {
        const { startPageNumber } = this.parent;
        if (typeof value !== 'number' || typeof startPageNumber !== 'number') {
          return true;
        }

        return value >= startPageNumber;
      }
    ),
  descriptionAr: string()
    .optional()
    .test('arabic-description', 'Arabic description is invalid', (value) => {
      if (!value) {
        return true;
      }

      return ARABIC_TEXT_REGEX.test(value);
    }),
  descriptionEn: string()
    .optional()
    .test('english-description', 'English description is invalid', (value) => {
      if (!value) {
        return true;
      }

      return ENGLISH_TEXT_REGEX.test(value);
    }),
  assignmentType: number()
    .required('Assignment type is required')
    .integer('Assignment type is required')
    .positive('Assignment type is required')
    .typeError('Assignment type is required'),
  attachment: mixed<File[]>().optional(),
  studentIds: array(string().required()).optional(),
};

export const AddSchoolTaskSchema = object(baseSchoolTaskSchema);

export const EditSchoolTaskSchema = object({
  id: string()
    .required('Task id is required')
    .typeError('Task id is required'),
  ...baseSchoolTaskSchema,
});

export type AddSchoolTaskProps = InferType<typeof AddSchoolTaskSchema>;
export type EditSchoolTaskProps = InferType<typeof EditSchoolTaskSchema>;