import * as yup from 'yup';

/**
 * Validation schema for Role creation/editing
 * Includes role name, description, and permissions
 */
export const roleValidationSchema = yup.object().shape({
  roleName: yup
    .string()
    .required('rolesManagement.validation.roleNameRequired')
    .min(3, 'rolesManagement.validation.roleNameMin')
    .max(100, 'rolesManagement.validation.roleNameMax')
    .trim(),

  description: yup
    .string()
    .max(500, 'rolesManagement.validation.descriptionMax')
    .trim()
    .optional()
    .nullable(),

  permissions: yup
    .array()
    .of(yup.string().required())
    .min(1, 'rolesManagement.validation.permissionsRequired')
    .required('rolesManagement.validation.permissionsRequired'),
});

/**
 * Type inference from the schema
 */
export type RoleFormValidation = yup.InferType<typeof roleValidationSchema>;

/**
 * Helper function to validate role form data
 * @param data - The form data to validate
 * @returns Promise that resolves to validation result
 */
export const validateRoleForm = async (data: Partial<RoleFormValidation>) => {
  try {
    await roleValidationSchema.validate(data, { abortEarly: false });
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
