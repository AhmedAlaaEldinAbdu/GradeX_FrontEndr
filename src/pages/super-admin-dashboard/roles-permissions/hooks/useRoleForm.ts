import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { roleValidationSchema } from '../validation/role.validation';

export interface RoleFormData {
  roleName: string;
  description?: string;
  permissions: string[];
}

export const initialRoleFormData: RoleFormData = {
  roleName: '',
  description: '',
  permissions: [],
};

interface UseRoleFormReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<RoleFormData, any, RoleFormData>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
}

/**
 * Custom hook for managing role form state with react-hook-form and yup validation
 * @param initialData - Optional initial data for edit mode
 * @returns Form methods and helper functions
 */
export const useRoleForm = (initialData?: RoleFormData): UseRoleFormReturn => {
  // Initialize react-hook-form with yup resolver
  const form = useForm<RoleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(roleValidationSchema) as any,
    defaultValues: initialData || initialRoleFormData,
    mode: 'onTouched', // Only validate after user interacts with field
    reValidateMode: 'onChange', // Re-validate on change after first validation
    criteriaMode: 'firstError', // Show only first error per field
  });

  /**
   * Validate the entire form
   * @returns Promise resolving to validation result
   */
  const validateForm = async (): Promise<boolean> => {
    const result = await form.trigger();
    return result;
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    form.reset(initialRoleFormData);
  };

  return {
    form,
    validateForm,
    resetForm,
  };
};
