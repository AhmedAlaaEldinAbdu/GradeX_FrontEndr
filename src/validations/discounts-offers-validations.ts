import * as yup from 'yup';
import { OfferApplyOn, OfferField, OfferOperator } from '@/shared/enums/enums';

const DiscountOfferConditionSchema = yup.object({
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

export const DiscountOfferSchema = yup.object().shape({
  id: yup.string().optional(),
  nameAr: yup.string().required('common.validation.required').trim(),
  nameEn: yup.string().required('common.validation.required').trim(),
  conditions: yup
    .array()
    .of(DiscountOfferConditionSchema)
    .min(1, 'common.validation.required')
    .required('common.validation.required'),
  applyOn: yup
    .number()
    .oneOf(Object.values(OfferApplyOn) as number[], 'common.validation.required')
    .required('common.validation.required'),
  discountType: yup.mixed<'value' | 'percentage'>().oneOf(['value', 'percentage']).required(),
  discountValue: yup
    .number()
    .typeError('common.validation.required')
    .moreThan(0, 'common.validation.required')
    .required('common.validation.required'),
  startDate: yup.string().required('common.validation.required'),
  endDate: yup
    .string()
    .required('common.validation.required')
    .test(
      'end-after-start',
      'fees.discounts.modal.invalidEndDate',
      function (endDate) {
        const parent = this.parent as { startDate?: string };
        const startDate = parent?.startDate;
        if (!startDate || !endDate) return true;
        // Dates come in ISO format (YYYY-MM-DD), so lexicographical compare works.
        return endDate >= startDate;
      }
    ),
  isActive: yup.boolean().required(),
  matchAllConditions: yup.boolean().required('common.validation.required'),
});

export type DiscountOfferValidation = yup.InferType<typeof DiscountOfferSchema>;

const DiscountOffersSchema = yup.array().of(DiscountOfferSchema);

export const validateDiscountOffers = async (
  offers: Array<Partial<DiscountOfferValidation>>,
  allowMultiple: boolean
) => {
  try {
    const list = allowMultiple ? offers : offers.slice(0, 1);
    await DiscountOffersSchema.validate(list, { abortEarly: false });
    return { isValid: true, errorsByIndex: {} as Record<number, Record<string, string>> };
  } catch (error) {
    if (!(error instanceof yup.ValidationError)) {
      return { isValid: false, errorsByIndex: {} as Record<number, Record<string, string>> };
    }

    // yup paths look like: [0].nameAr
    const errorsByIndex: Record<number, Record<string, string>> = {};
    for (const err of error.inner) {
      if (!err.path) continue;
      const match = err.path.match(/^\[(\d+)\]\.(.+)$/);
      if (!match) continue;
      const index = Number(match[1]);
      const field = match[2].replace(/\[(\d+)\]/g, '.$1');
      if (!errorsByIndex[index]) errorsByIndex[index] = {};
      // keep the first error per field
      if (!errorsByIndex[index][field]) errorsByIndex[index][field] = err.message;
    }

    return { isValid: false, errorsByIndex };
  }
};
