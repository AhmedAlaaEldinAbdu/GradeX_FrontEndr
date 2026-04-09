import { object, string, type InferType } from 'yup';

export const StudentInterviewFormSchema = object({
  studentName: string()
    .required('interviews.validation.studentNameRequired')
    .typeError('interviews.validation.studentNameRequired'),
  educationalStage: string()
    .required('interviews.validation.educationalStageRequired')
    .typeError('interviews.validation.educationalStageRequired'),
  supervisorName: string().notRequired().default(''),
  interviewDate: string()
    .required('interviews.validation.interviewDateRequired')
    .typeError('interviews.validation.interviewDateRequired'),
  startTime: string()
    .required('interviews.validation.startTimeRequired')
    .typeError('interviews.validation.startTimeRequired'),
  endTime: string().notRequired().default(''),
  notes: string().notRequired().default(''),
});

export type StudentInterviewFormProps = InferType<typeof StudentInterviewFormSchema>;

// Matches Swagger payload for /api/StudentInterview
export const StudentInterviewApiSchema = object({
  nameAr: string()
    .required('common.validation.nameArRequired')
    .typeError('common.validation.nameArRequired')
    .matches(/^[\u0600-\u06FF\s]+$/, 'interviews.validation.nameArInvalid'),
  nameEn: string()
    .required('common.validation.nameEnRequired')
    .typeError('common.validation.nameEnRequired')
    .matches(/^[a-zA-Z\s]+$/, 'interviews.validation.nameEnInvalid'),
  schoolBranchesId: string()
    .required('interviews.validation.schoolBranchesIdRequired')
    .typeError('interviews.validation.schoolBranchesIdRequired'),
  studentId: string()
    .required('common.validation.required')
    .typeError('common.validation.required'),
  supervisorId: string()
    .transform((value) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
    .notRequired(),
  interviewDate: string()
    .required('interviews.validation.interviewDateRequired')
    .typeError('interviews.validation.interviewDateRequired'),
  startTime: string()
    .required('interviews.validation.startTimeRequired')
    .typeError('interviews.validation.startTimeRequired'),
  endTime: string().notRequired().default(''),
});

export type StudentInterviewApiProps = InferType<typeof StudentInterviewApiSchema>;
