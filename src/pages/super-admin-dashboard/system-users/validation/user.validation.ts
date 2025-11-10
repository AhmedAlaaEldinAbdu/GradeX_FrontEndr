import * as yup from 'yup';

/**
 * Validation schema for User creation
 * Includes full name, email, phone, role, and country
 */
export const userValidationSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('rolesManagement.validation.userNameRequired')
    .min(3, 'rolesManagement.validation.userNameMin')
    .max(100, 'rolesManagement.validation.userNameMax')
    .trim(),

  email: yup
    .string()
    .required('rolesManagement.validation.emailRequired')
    .email('rolesManagement.validation.emailInvalid')
    .trim(),

  phoneNumber: yup.string().required('rolesManagement.validation.phoneRequired').trim(),

  roleId: yup.string().required('rolesManagement.validation.roleRequired'),

  lkCountryId: yup.string().required('rolesManagement.validation.countryRequired'),
});

/**
 * Validation schema for User editing
 * Same as creation but without country requirement
 */
export const userEditValidationSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('rolesManagement.validation.userNameRequired')
    .min(3, 'rolesManagement.validation.userNameMin')
    .max(100, 'rolesManagement.validation.userNameMax')
    .trim(),

  email: yup
    .string()
    .required('rolesManagement.validation.emailRequired')
    .email('rolesManagement.validation.emailInvalid')
    .trim(),

  phoneNumber: yup.string().required('rolesManagement.validation.phoneRequired').trim(),

  roleId: yup.string().required('rolesManagement.validation.roleRequired'),
});

/**
 * Type inference from the schema
 */
export type UserFormValidation = yup.InferType<typeof userValidationSchema>;

/**
 * Helper function to validate user form data
 * @param data - The form data to validate
 * @returns Promise that resolves to validation result
 */
export const validateUserForm = async (data: Partial<UserFormValidation>) => {
  try {
    await userValidationSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.reduce(
        (acc, err) => {
          if (err.path) {
            acc[err.path] = err.message;
          }
          return acc;
        },
        {} as Record<string, string>
      );
      return { isValid: false, errors };
    }
    return { isValid: false, errors: {} };
  }
};
