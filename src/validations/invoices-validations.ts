import * as yup from 'yup';
import { InvoicePaymentType } from '@/shared/enums/enums';

export const IssueInvoiceSchema = yup.object({
  customerId: yup
    .string()
    .required('invoices.validation.customerRequired')
    .typeError('invoices.validation.customerRequired'),
  invoiceDate: yup
    .string()
    .required('invoices.validation.invoiceDateRequired')
    .typeError('invoices.validation.invoiceDateRequired'),
  paymentMethodId: yup
    .string()
    .required('invoices.validation.paymentToolRequired')
    .typeError('invoices.validation.paymentToolRequired'),
  taxPercentage: yup
    .number()
    .min(0, 'invoices.validation.taxMin')
    .nullable()
    .optional()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null || originalValue === undefined ? null : value
    ),
  paymentType: yup.string().optional(),
  installmentId: yup
    .string()
    .nullable()
    .when('paymentType', {
      is: (val: string) => Number(val) === InvoicePaymentType.Deferred,
      then: (schema) => schema.required('invoices.validation.installmentRequired'),
      otherwise: (schema) => schema.optional().nullable(),
    }),
});

export type IssueInvoiceFormValues = yup.InferType<typeof IssueInvoiceSchema>;

export const validateIssueInvoiceForm = async (data: Partial<IssueInvoiceFormValues>) => {
  try {
    await IssueInvoiceSchema.validate(data, { abortEarly: false });
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
