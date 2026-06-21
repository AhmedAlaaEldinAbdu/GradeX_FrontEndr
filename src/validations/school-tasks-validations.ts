import { array, mixed, number, object, string, type InferType } from 'yup';

const SCHOOL_TASK_TYPES = [1, 2, 3, 4, 5, 6] as const;

const baseSchoolTaskSchema = {
  schoolBranchesId: string()
    .required('tasksManagement.validation.schoolBranchRequired')
    .typeError('tasksManagement.validation.schoolBranchRequired'),
  gradeId: string()
    .required('tasksManagement.validation.educationalStageRequired')
    .typeError('tasksManagement.validation.educationalStageRequired'),
  classroomId: string()
    .required('tasksManagement.validation.classroomRequired')
    .typeError('tasksManagement.validation.classroomRequired'),
  materialId: string()
    .required('tasksManagement.validation.subjectRequired')
    .typeError('tasksManagement.validation.subjectRequired'),
  nameAr: string()
    .required('tasksManagement.validation.taskNameArRequired')
    .typeError('tasksManagement.validation.taskNameArRequired'),
  nameEn: string()
    .required('tasksManagement.validation.taskNameEnRequired')
    .typeError('tasksManagement.validation.taskNameEnRequired'),
  taskType: number()
    .required('tasksManagement.validation.taskTypeRequired')
    .oneOf([...SCHOOL_TASK_TYPES], 'tasksManagement.validation.taskTypeRequired')
    .typeError('tasksManagement.validation.taskTypeRequired'),
  date: string()
    .required('tasksManagement.validation.taskDateRequired')
    .typeError('tasksManagement.validation.taskDateRequired'),
  deliveryDate: string()
    .required('tasksManagement.validation.deliveryDateRequired')
    .typeError('tasksManagement.validation.deliveryDateRequired'),
  descriptionAr: string().optional(),
  descriptionEn: string().optional(),
  assignmentType: number()
    .required('tasksManagement.validation.assignmentTypeRequired')
    .integer('tasksManagement.validation.assignmentTypeRequired')
    .positive('tasksManagement.validation.assignmentTypeRequired')
    .typeError('tasksManagement.validation.assignmentTypeRequired'),
  attachment: mixed<File[]>().optional(),
  studentIds: array(string().required()).optional(),
};

export const AddSchoolTaskSchema = object(baseSchoolTaskSchema);

export const EditSchoolTaskSchema = object({
  id: string().required('Task id is required').typeError('Task id is required'),
  ...baseSchoolTaskSchema,
});

export type AddSchoolTaskProps = InferType<typeof AddSchoolTaskSchema>;
export type EditSchoolTaskProps = InferType<typeof EditSchoolTaskSchema>;
