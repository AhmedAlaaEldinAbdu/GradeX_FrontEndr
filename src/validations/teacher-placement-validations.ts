import { array, object, string, type InferType } from 'yup';

export const EditTeacherPlacementSchema = object({
  subjectId: string()
    .required('teachers.placement.validation.subjectRequired')
    .typeError('teachers.placement.validation.subjectRequired'),
  gradeId: string()
    .required('teachers.placement.validation.gradeRequired')
    .typeError('teachers.placement.validation.gradeRequired'),
  classroomIds: array()
    .of(string().required())
    .required('teachers.placement.validation.classroomsRequired')
    .min(1, 'teachers.placement.validation.classroomsRequired')
    .typeError('teachers.placement.validation.classroomsRequired'),
  bookIds: array().of(string().defined()).default([]),
});

export type EditTeacherPlacementProps = InferType<typeof EditTeacherPlacementSchema>;
