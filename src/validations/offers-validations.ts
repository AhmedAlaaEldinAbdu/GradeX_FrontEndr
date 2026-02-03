import * as yup from 'yup';
import { OfferApplyOn, OfferField, OfferOperator } from '@/shared/enums/enums';

export const OfferConditionSchema = yup.object({
  field: yup
    .number()
    .oneOf(Object.values(OfferField) as number[], 'common.validation.required')
    .typeError('common.validation.required')
    .required('common.validation.required'),
  operator: yup
    .number()
    .oneOf(Object.values(OfferOperator) as number[], 'common.validation.required')
    .typeError('common.validation.required')
    .required('common.validation.required'),
  value: yup.string().trim().required('common.validation.required'),
});

export const OfferSchema = yup
  .object({
    schoolBranchId: yup.string().trim().required('common.validation.required'),
    nameAr: yup.string().trim().required('common.validation.required'),
    nameEn: yup.string().trim().required('common.validation.required'),
    offerType: yup.number().typeError('common.validation.required').required('common.validation.required'),
    applyOn: yup
      .number()
      .oneOf(Object.values(OfferApplyOn) as number[], 'common.validation.required')
      .typeError('common.validation.required')
      .required('common.validation.required'),
    amount: yup
      .number()
      .nullable()
      .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === undefined) return null;
        return Number.isNaN(value) ? null : value;
      }),
    percentage: yup
      .number()
      .nullable()
      .transform((value, originalValue) => {
        if (originalValue === '' || originalValue === undefined) return null;
        return Number.isNaN(value) ? null : value;
      })
      .max(100, 'common.validation.required'),
    startDate: yup.string().required('common.validation.required'),
    endDate: yup
      .string()
      .required('common.validation.required')
      .test('endAfterStart', 'fees.discounts.modal.invalidEndDate', function (endDate) {
        const startDate = this.parent.startDate as string | undefined;
        if (!startDate || !endDate) return true;
        return new Date(endDate).getTime() >= new Date(startDate).getTime();
      }),
    isActive: yup.boolean().required('common.validation.required'),
    matchAllConditions: yup.boolean().required('common.validation.required'),
    conditions: yup
      .array()
      .of(OfferConditionSchema)
      .min(1, 'common.validation.required')
      .required('common.validation.required'),
  })
  .test('amountOrPercentage', 'common.validation.required', function (value) {
    const amount = value?.amount ?? null;
    const percentage = value?.percentage ?? null;

    const hasAmount = typeof amount === 'number' && amount > 0;
    const hasPercentage = typeof percentage === 'number' && percentage > 0 && percentage <= 100;

    return hasAmount || hasPercentage;
  });

export type OfferFormValues = yup.InferType<typeof OfferSchema>;

export const validateOffer = async (values: unknown) => {
  try {
    await OfferSchema.validate(values, { abortEarly: false });
    return { isValid: true as const, errors: {} as Record<string, string> };
  } catch (err) {
    if (!(err instanceof yup.ValidationError)) {
      return { isValid: false as const, errors: { _error: 'common.validation.required' } };
    }

    const errors: Record<string, string> = {};
    err.inner.forEach((e) => {
      if (!e.path) return;
      if (!errors[e.path]) errors[e.path] = e.message;
    });

    return { isValid: false as const, errors };
  }
};
