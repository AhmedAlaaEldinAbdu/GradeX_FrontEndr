import * as yup from 'yup';

export const customerSchema = yup.object({
  clientName: yup
    .string()
    .required('customers.validation.clientNameRequired')
    .typeError('customers.validation.clientNameRequired'),
  email: yup
    .string()
    .required('customers.validation.emailRequired')
    .email('customers.validation.emailInvalid')
    .typeError('customers.validation.emailRequired'),
  mobile: yup
    .string()
    .required('customers.validation.mobileRequired')
    .typeError('customers.validation.mobileRequired'),
  additionalMobile: yup.string().optional(),
  nationalId: yup
    .string()
    .optional()
    .test('national-id', 'customers.validation.nationalIdInvalid', (value) => {
      if (!value) return true;
      return /^[0-9]{10}$/.test(value);
    }),
  lkCountryId: yup
    .string()
    .required('customers.validation.countryRequired')
    .typeError('customers.validation.countryRequired'),
  regionId: yup
    .string()
    .required('customers.validation.cityRequired')
    .typeError('customers.validation.cityRequired'),
});

export type CustomerFormValues = yup.InferType<typeof customerSchema>;

export const validateCustomerForm = async (data: Partial<CustomerFormValues>) => {
  try {
    await customerSchema.validate(data, { abortEarly: false });
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
