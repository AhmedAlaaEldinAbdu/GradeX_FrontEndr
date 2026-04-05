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
          .typeError('classrooms.validation.classroomNameRequired')
          .matches(/^[\u0600-\u06FF\s\d\p{P}]+$/u, 'classrooms.validation.classroomNameArInvalid'),
        nameEn: string()
          .required('classrooms.validation.classroomNameEnRequired')
          .typeError('classrooms.validation.classroomNameEnRequired')
          .matches(/^[a-zA-Z\s\d\p{P}]+$/u, 'classrooms.validation.classroomNameEnInvalid'),
        alias: string()
          .default('')
          .test(
            'arabic-or-empty',
            'classrooms.validation.classroomNicknameArInvalid',
            (value) => !value || /^[\u0600-\u06FF\s\d\p{P}]+$/u.test(value)
          ),
        aliasEn: string()
          .default('')
          .test(
            'english-or-empty',
            'classrooms.validation.classroomNicknameEnInvalid',
            (value) => !value || /^[a-zA-Z\s\d\p{P}]+$/u.test(value)
          ),
        note: string().default(''),
        noteEn: string().default(''),
        maxStudents: number()
          .required('classrooms.validation.maxStudentsRequired')
          .positive('classrooms.validation.maxStudentsMustBePositive')
          .integer('classrooms.validation.maxStudentsMustBeInteger')
          .max(100, 'classrooms.validation.maxStudentsExceeded')
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
    .typeError('classrooms.validation.classroomNameRequired')
    .matches(/^[\u0600-\u06FF\s\d\p{P}]+$/u, 'classrooms.validation.classroomNameArInvalid'),
  nameEn: string()
    .required('classrooms.validation.classroomNameEnRequired')
    .typeError('classrooms.validation.classroomNameEnRequired')
    .matches(/^[a-zA-Z\s\d\p{P}]+$/u, 'classrooms.validation.classroomNameEnInvalid'),
  alias: string()
    .default('')
    .test(
      'arabic-or-empty',
      'classrooms.validation.classroomNicknameArInvalid',
      (value) => !value || /^[\u0600-\u06FF\s\d\p{P}]+$/u.test(value)
    ),
  aliasEn: string()
    .default('')
    .test(
      'english-or-empty',
      'classrooms.validation.classroomNicknameEnInvalid',
      (value) => !value || /^[a-zA-Z\s\d\p{P}]+$/u.test(value)
    ),
  note: string().default(''),
  noteEn: string().default(''),
  maxStudents: number()
    .required('classrooms.validation.maxStudentsRequired')
    .positive('classrooms.validation.maxStudentsMustBePositive')
    .integer('classrooms.validation.maxStudentsMustBeInteger')
    .max(100, 'classrooms.validation.maxStudentsExceeded')
    .typeError('classrooms.validation.maxStudentsRequired'),
  classImage: mixed().optional(),
});

export type ClassroomsProps = InferType<typeof ClassroomsSchema>;
export type EditClassroomProps = InferType<typeof EditClassroomSchema>;
