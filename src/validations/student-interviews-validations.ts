import { object, string, type InferType } from 'yup';

export const StudentInterviewFormSchema = object({
  studentName: string()
    .required('interviews.validation.studentNameRequired')
    .typeError('interviews.validation.studentNameRequired'),
  educationalStage: string()
    .required('interviews.validation.educationalStageRequired')
    .typeError('interviews.validation.educationalStageRequired'),
  supervisorName: string()
    .required('interviews.validation.supervisorNameRequired')
    .typeError('interviews.validation.supervisorNameRequired'),
  interviewDate: string()
    .required('interviews.validation.interviewDateRequired')
    .typeError('interviews.validation.interviewDateRequired'),
  startTime: string()
    .required('interviews.validation.startTimeRequired')
    .typeError('interviews.validation.startTimeRequired'),
  endTime: string()
    .required('interviews.validation.endTimeRequired')
    .typeError('interviews.validation.endTimeRequired'),
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
  supervisorId: string()
    .required('interviews.validation.supervisorIdRequired')
    .typeError('interviews.validation.supervisorIdRequired'),
  interviewDate: string()
    .required('interviews.validation.interviewDateRequired')
    .typeError('interviews.validation.interviewDateRequired'),
  startTime: string()
    .required('interviews.validation.startTimeRequired')
    .typeError('interviews.validation.startTimeRequired'),
  endTime: string()
    .required('interviews.validation.endTimeRequired')
    .typeError('interviews.validation.endTimeRequired'),
});

export type StudentInterviewApiProps = InferType<typeof StudentInterviewApiSchema>;
