import { array, number, object, string, type InferType } from 'yup';

export const AddSubjectSchema = object({
  materialLevel: string()
    .required('subjects.validation.levelRequired')
    .typeError('subjects.validation.levelRequired'),
  gradeIds: array()
    .of(string().required())
    .min(1, 'subjects.validation.schoolStagesRequired')
    .required('subjects.validation.schoolStagesRequired'),
  subjects: array()
    .of(
      object({
        name: string()
          .required('subjects.validation.subjectNameRequired')
          .typeError('subjects.validation.subjectNameRequired')
          .matches(/^[\u0600-\u06FF\s\d\p{P}]+$/u, 'subjects.validation.subjectNameArInvalid'),
        nameEn: string()
          .required('subjects.validation.subjectNameEnRequired')
          .typeError('subjects.validation.subjectNameEnRequired')
          .matches(/^[a-zA-Z\s\d\p{P}]+$/u, 'subjects.validation.subjectNameEnInvalid'),
      })
    )
    .required('subjects.validation.requiredList')
    .min(1, 'subjects.validation.atLeastOne')
    .typeError('subjects.validation.requiredList'),
});

export const SubjectsSchema = object({
  materialLevel: number()
    .required('subjects.validation.levelRequired')
    .typeError('subjects.validation.levelRequired'),
  subjects: array()
    .of(
      object({
        name: string()
          .required('subjects.validation.subjectNameRequired')
          .typeError('subjects.validation.subjectNameRequired')
          .matches(/^[\u0600-\u06FF\s\d\p{P}]+$/u, 'subjects.validation.subjectNameArInvalid'),
        nameEn: string()
          .required('subjects.validation.subjectNameEnRequired')
          .typeError('subjects.validation.subjectNameEnRequired')
          .matches(/^[a-zA-Z\s\d\p{P}]+$/u, 'subjects.validation.subjectNameEnInvalid'),
      })
    )
    .required('subjects.validation.requiredList')
    .min(1, 'subjects.validation.atLeastOne')
    .typeError('subjects.validation.requiredList'),
});

export const EditSubjectSchema = object({
  materialLevel: string()
    .required('subjects.validation.levelRequired')
    .typeError('subjects.validation.levelRequired'),
  gradeIds: array()
    .of(string().required())
    .min(1, 'subjects.validation.schoolStagesRequired')
    .required('subjects.validation.schoolStagesRequired'),
  name: string()
    .required('subjects.validation.subjectNameRequired')
    .typeError('subjects.validation.subjectNameRequired')
    .matches(/^[\u0600-\u06FF\s\d\p{P}]+$/u, 'subjects.validation.subjectNameArInvalid'),
  nameEn: string()
    .required('subjects.validation.subjectNameEnRequired')
    .typeError('subjects.validation.subjectNameEnRequired')
    .matches(/^[a-zA-Z\s\d\p{P}]+$/u, 'subjects.validation.subjectNameEnInvalid'),
});

export type AddSubjectProps = InferType<typeof AddSubjectSchema>;
export type SubjectsProps = InferType<typeof SubjectsSchema>;
export type EditSubjectProps = InferType<typeof EditSubjectSchema>;
