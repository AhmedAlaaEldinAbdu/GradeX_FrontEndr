import { object, string, type InferType } from 'yup';

export const AcademicSubsystemSchema = object({
  nameAr: string()
    .required('common.validation.nameArRequired')
    .typeError('common.validation.nameRequired'),
  nameEn: string()
    .required('common.validation.nameEnRequired')
    .typeError('common.validation.nameRequired'),
});

export type AcademicSubsystemForm = InferType<typeof AcademicSubsystemSchema>;
