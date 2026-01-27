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
