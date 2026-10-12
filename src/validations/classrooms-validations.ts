import { array, mixed, number, object, string, type InferType } from 'yup';

export const ClassroomsSchema = object({
  academicSystem: string()
    .required('classrooms.validation.academicSystemRequired')
    .typeError('classrooms.validation.academicSystemRequired'),
  educationalStage: string()
    .required('classrooms.validation.educationalStageRequired')
    .typeError('classrooms.validation.educationalStageRequired'),
  classrooms: array()
    .of(
      object({
        name: string()
          .required('classrooms.validation.classroomNameRequired')
          .typeError('classrooms.validation.classroomNameRequired'),
        nameEn: string()
          .required('classrooms.validation.classroomNameEnRequired')
          .typeError('classrooms.validation.classroomNameEnRequired'),
        alias: string().default(''),
        aliasEn: string().default(''),
        note: string().default(''),
        noteEn: string().default(''),
        maxStudents: number()
          .required('classrooms.validation.maxStudentsRequired')
          .positive('classrooms.validation.maxStudentsMustBePositive')
          .integer('classrooms.validation.maxStudentsMustBeInteger')
          .typeError('classrooms.validation.maxStudentsRequired'),
        classImage: mixed().optional(),
      })
    )
    .required('classrooms.validation.requiredList')
    .min(1, 'classrooms.validation.atLeastOne')
    .typeError('classrooms.validation.requiredList'),
});

export const EditClassroomSchema = object({
  academicSystem: string()
    .required('classrooms.validation.academicSystemRequired')
    .typeError('classrooms.validation.academicSystemRequired'),
  educationalStage: string()
    .required('classrooms.validation.educationalStageRequired')
    .typeError('classrooms.validation.educationalStageRequired'),
  name: string()
    .required('classrooms.validation.classroomNameRequired')
    .typeError('classrooms.validation.classroomNameRequired'),
  nameEn: string()
    .required('classrooms.validation.classroomNameEnRequired')
    .typeError('classrooms.validation.classroomNameEnRequired'),
  alias: string().default(''),
  aliasEn: string().default(''),
  note: string().default(''),
  noteEn: string().default(''),
  maxStudents: number()
    .required('classrooms.validation.maxStudentsRequired')
    .positive('classrooms.validation.maxStudentsMustBePositive')
    .integer('classrooms.validation.maxStudentsMustBeInteger')
    .typeError('classrooms.validation.maxStudentsRequired'),
  classImage: mixed().optional(),
});

export type ClassroomsProps = InferType<typeof ClassroomsSchema>;
export type EditClassroomProps = InferType<typeof EditClassroomSchema>;
