import { mixed, object, string, type InferType } from 'yup';

export const EditTaskStudentSchema = object({
  id: string()
    .required('taskStudents.validation.idRequired')
    .typeError('taskStudents.validation.idRequired'),
  attachment: mixed<File[]>().optional(),
});

export type EditTaskStudentProps = InferType<typeof EditTaskStudentSchema>;
