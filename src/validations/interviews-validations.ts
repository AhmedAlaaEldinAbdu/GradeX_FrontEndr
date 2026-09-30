import { number, object, string, type InferType } from 'yup';
import { InterviewType } from '@/services/api/types/interviews.types';

export const InterviewFormSchema = object({
  schoolBranchesId: string()
    .required('interviews.validation.schoolBranchesIdRequired')
    .typeError('interviews.validation.schoolBranchesIdRequired'),
  jobAdvertisementId: string()
    .required('interviews.validation.jobAdvertisementIdRequired')
    .typeError('interviews.validation.jobAdvertisementIdRequired'),
  teacherId: string()
    .required('interviews.validation.teacherIdRequired')
    .typeError('interviews.validation.teacherIdRequired'),
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
  interViewType: number()
    .oneOf(
      [InterviewType.ONLINE, InterviewType.OFFLINE],
      'interviews.validation.interViewTypeInvalid'
    )
    .required('interviews.validation.interViewTypeRequired')
    .typeError('interviews.validation.interViewTypeRequired'),
});

export type InterviewFormProps = InferType<typeof InterviewFormSchema>;
