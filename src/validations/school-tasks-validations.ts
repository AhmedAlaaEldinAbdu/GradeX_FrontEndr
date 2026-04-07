import { array, mixed, number, object, string, type InferType } from 'yup';

const ARABIC_TEXT_REGEX = /^[\u0600-\u06FF\s\d\p{P}]+$/u;
const ENGLISH_TEXT_REGEX = /^[a-zA-Z\s\d\p{P}]+$/u;
const SCHOOL_TASK_TYPES = [1, 2, 3, 4, 5, 6] as const;

const baseSchoolTaskSchema = {
  schoolBranchesId: string()
    .required('schoolTasks.validation.branchRequired')
    .typeError('schoolTasks.validation.branchRequired'),
  gradeId: string()
    .required('schoolTasks.validation.gradeRequired')
    .typeError('schoolTasks.validation.gradeRequired'),
  classroomId: string()
    .required('schoolTasks.validation.classroomRequired')
    .typeError('schoolTasks.validation.classroomRequired'),
  materialId: string()
    .required('schoolTasks.validation.materialRequired')
    .typeError('schoolTasks.validation.materialRequired'),
  nameAr: string()
    .required('schoolTasks.validation.nameArRequired')
    .typeError('schoolTasks.validation.nameArRequired')
    .matches(ARABIC_TEXT_REGEX, 'schoolTasks.validation.nameArInvalid'),
  nameEn: string()
    .required('schoolTasks.validation.nameEnRequired')
    .typeError('schoolTasks.validation.nameEnRequired')
    .matches(ENGLISH_TEXT_REGEX, 'schoolTasks.validation.nameEnInvalid'),
  taskType: number()
    .required('schoolTasks.validation.taskTypeRequired')
    .oneOf([...SCHOOL_TASK_TYPES], 'schoolTasks.validation.taskTypeRequired')
    .typeError('schoolTasks.validation.taskTypeRequired'),
  date: string()
    .required('schoolTasks.validation.dateRequired')
    .typeError('schoolTasks.validation.dateRequired'),
  deliveryDate: string()
    .required('schoolTasks.validation.deliveryDateRequired')
    .typeError('schoolTasks.validation.deliveryDateRequired'),
  startPageNumber: number()
    .required('schoolTasks.validation.startPageRequired')
    .integer('schoolTasks.validation.startPageInteger')
    .min(0, 'schoolTasks.validation.startPageMin')
    .typeError('schoolTasks.validation.startPageRequired'),
  endPageNumber: number()
    .required('schoolTasks.validation.endPageRequired')
    .integer('schoolTasks.validation.endPageInteger')
    .min(0, 'schoolTasks.validation.endPageMin')
    .typeError('schoolTasks.validation.endPageRequired')
    .test(
      'end-page-greater-than-start-page',
      'schoolTasks.validation.endPageGreaterThanStartPage',
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
    .test('arabic-description', 'schoolTasks.validation.descriptionArInvalid', (value) => {
      if (!value) {
        return true;
      }

      return ARABIC_TEXT_REGEX.test(value);
    }),
  descriptionEn: string()
    .optional()
    .test('english-description', 'schoolTasks.validation.descriptionEnInvalid', (value) => {
      if (!value) {
        return true;
      }

      return ENGLISH_TEXT_REGEX.test(value);
    }),
  assignmentType: number()
    .required('schoolTasks.validation.assignmentTypeRequired')
    .integer('schoolTasks.validation.assignmentTypeRequired')
    .positive('schoolTasks.validation.assignmentTypeRequired')
    .typeError('schoolTasks.validation.assignmentTypeRequired'),
  attachment: mixed<File[]>().optional(),
  studentIds: array(string().required()).optional(),
};

export const AddSchoolTaskSchema = object(baseSchoolTaskSchema);

export const EditSchoolTaskSchema = object({
  id: string()
    .required('schoolTasks.validation.idRequired')
    .typeError('schoolTasks.validation.idRequired'),
  ...baseSchoolTaskSchema,
});

export type AddSchoolTaskProps = InferType<typeof AddSchoolTaskSchema>;
export type EditSchoolTaskProps = InferType<typeof EditSchoolTaskSchema>;