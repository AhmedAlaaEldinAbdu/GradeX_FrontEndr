import * as yup from 'yup';

export const preparationValidationSchema = yup.object({
  date: yup.string().required('preparations.form.validation.dateRequired'),
  educationalStage: yup.string().required('preparations.form.validation.educationalStageRequired'),
  grades: yup.array().of(yup.string()).min(1, 'preparations.form.validation.gradesRequired'),
  subject: yup.string().required('preparations.form.validation.subjectRequired'),
  topic: yup
    .string()
    .required('preparations.form.validation.topicRequired')
    .min(3, 'preparations.form.validation.topicMin')
    .max(100, 'preparations.form.validation.topicMax')
    .trim(),
  content: yup
    .string()
    .required('preparations.form.validation.contentRequired')
    .min(10, 'preparations.form.validation.contentMin')
    .trim(),
  bookName: yup.string().optional(),
  fromPage: yup
    .string()
    .optional()
    .matches(/^\d*$/, 'preparations.form.validation.pageMustBeNumber'),
  toPage: yup
    .string()
    .optional()
    .matches(/^\d*$/, 'preparations.form.validation.pageMustBeNumber')
    .test('is-greater', 'preparations.form.validation.toPageMustBeGreater', function (value) {
      const { fromPage } = this.parent;
      if (!fromPage || !value) return true;
      return parseInt(value) >= parseInt(fromPage);
    }),
});

export type PreparationFormValidation = yup.InferType<typeof preparationValidationSchema>;

export const validatePreparationForm = async (data: Partial<PreparationFormValidation>) => {
  try {
    await preparationValidationSchema.validate(data, { abortEarly: false });
    return { isValid: true as const, errors: {} as Record<string, string> };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.reduce(
        (acc, err) => {
          if (err.path && !acc[err.path]) acc[err.path] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );
      return { isValid: false as const, errors };
    }
    return { isValid: false as const, errors: {} as Record<string, string> };
  }
};
