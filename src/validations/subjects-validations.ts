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
          .typeError('subjects.validation.subjectNameRequired'),
        nameEn: string()
          .required('subjects.validation.subjectNameEnRequired')
          .typeError('subjects.validation.subjectNameEnRequired'),
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
          .typeError('subjects.validation.subjectNameRequired'),
        nameEn: string()
          .required('subjects.validation.subjectNameEnRequired')
          .typeError('subjects.validation.subjectNameEnRequired'),
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
    .typeError('subjects.validation.subjectNameRequired'),
  nameEn: string()
    .required('subjects.validation.subjectNameEnRequired')
    .typeError('subjects.validation.subjectNameEnRequired'),
});

export const SubjectPopupSchema = object({
  subSystemId: string().required('subjects.validation.academicSystemRequired'),
  lkSchoolStageIds: array()
    .of(string().required())
    .min(1, 'subjects.validation.educationalStagesRequired')
    .required('subjects.validation.educationalStagesRequired'),
  gradeIds: array()
    .of(string().required())
    .min(1, 'subjects.validation.gradesRequired')
    .required('subjects.validation.gradesRequired'),
  name: string().trim().required('subjects.validation.subjectNameRequired'),
  nameEn: string().trim().required('subjects.validation.subjectNameEnRequired'),
  teacherIds: array()
    .of(string().required())
    .min(1, 'subjects.validation.teachersRequired')
    .required('subjects.validation.teachersRequired'),
  description: string().default(''),
  descriptionEn: string().default(''),
});

export type SubjectPopupValues = InferType<typeof SubjectPopupSchema>;
export type AddSubjectProps = InferType<typeof AddSubjectSchema>;
export type SubjectsProps = InferType<typeof SubjectsSchema>;
export type EditSubjectProps = InferType<typeof EditSubjectSchema>;
