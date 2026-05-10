import * as yup from 'yup';

/**
 * Validation schema for User creation
 * Includes full name, email, phone, role, and country
 */
export const userValidationSchema = yup.object({
  fullName: yup
    .string()
    .required('rolesManagement.validation.userNameRequired')
    .min(3, 'rolesManagement.validation.userNameMin')
    .max(100, 'rolesManagement.validation.userNameMax')
    .test(
      'triple-name',
      'rolesManagement.validation.userNameTriple',
      (value) => !!value && value.trim().split(/\s+/).filter(Boolean).length >= 3
    )
    .trim(),

  email: yup
    .string()
    .required('rolesManagement.validation.emailRequired')
    .email('rolesManagement.validation.emailInvalid')
    .trim(),

  phoneNumber: yup.string().required('rolesManagement.validation.phoneRequired').trim(),

  roleId: yup.string().required('rolesManagement.validation.roleRequired'),

  lkCountryId: yup.string().required('rolesManagement.validation.countryRequired'),

  schoolBrancheId: yup.string().optional(),
});

/**
 * Validation schema for User editing
 * Same as creation but without country requirement
 */
export const userEditValidationSchema = yup.object({
  fullName: yup
    .string()
    .required('rolesManagement.validation.userNameRequired')
    .min(3, 'rolesManagement.validation.userNameMin')
    .max(100, 'rolesManagement.validation.userNameMax')
    .test(
      'triple-name',
      'rolesManagement.validation.userNameTriple',
      (value) => !!value && value.trim().split(/\s+/).filter(Boolean).length >= 3
    )
    .trim(),

  email: yup
    .string()
    .required('rolesManagement.validation.emailRequired')
    .email('rolesManagement.validation.emailInvalid')
    .trim(),

  phoneNumber: yup.string().required('rolesManagement.validation.phoneRequired').trim(),

  roleId: yup.string().required('rolesManagement.validation.roleRequired'),

  schoolBrancheId: yup.string().optional(),
});

/**
 * Type inference from the schema
 */
export type UserFormValidation = yup.InferType<typeof userValidationSchema>;

/**
 * Helper function to validate user form data
 */
export const validateUserForm = async (data: Partial<UserFormValidation>) => {
  try {
    await userValidationSchema.validate(data, { abortEarly: false });
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
