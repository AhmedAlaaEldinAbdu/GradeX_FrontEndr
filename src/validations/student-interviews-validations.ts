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
    .typeError('common.validation.nameArRequired'),
  nameEn: string()
    .required('common.validation.nameEnRequired')
    .typeError('common.validation.nameEnRequired'),
  schoolBranchesId: string()
    .required('interviews.validation.schoolBranchesIdRequired')
    .typeError('interviews.validation.schoolBranchesIdRequired'),
  studentId: string()
    .required('common.validation.required')
    .typeError('common.validation.required'),
  supervisorId: string().notRequired().default(''),
  interviewDate: string()
    .required('interviews.validation.interviewDateRequired')
    .typeError('interviews.validation.interviewDateRequired'),
  startTime: string()
    .required('interviews.validation.startTimeRequired')
    .typeError('interviews.validation.startTimeRequired'),
  endTime: string().notRequired().default(''),
});

export type StudentInterviewApiProps = InferType<typeof StudentInterviewApiSchema>;
