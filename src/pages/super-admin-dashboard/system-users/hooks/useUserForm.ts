import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  userValidationSchema,
  userEditValidationSchema,
} from '@/validations/system-user-validations';

export interface UserFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  lkCountryId: string;
  schoolBranchId: string;
}

export const initialUserFormData: UserFormData = {
  fullName: '',
  email: '',
  phoneNumber: '',
  roleId: '',
  lkCountryId: '',
  schoolBranchId: '',
};

interface UseUserFormReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<UserFormData, any, UserFormData>;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
}

interface UseUserFormOptions {
  initialData?: UserFormData;
  isEditMode?: boolean;
}

/**
 * Custom hook for managing user form state with react-hook-form and yup validation
 * @param options - Configuration options including initial data and edit mode
 * @returns Form methods and helper functions
 */
export const useUserForm = (options?: UseUserFormOptions): UseUserFormReturn => {
  const { initialData, isEditMode = false } = options || {};

  // Use different validation schema based on mode
  const validationSchema = isEditMode ? userEditValidationSchema : userValidationSchema;

  // Initialize react-hook-form with yup resolver
  const form = useForm<UserFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(validationSchema) as any,
    defaultValues: initialData || initialUserFormData,
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
    form.reset(initialUserFormData);
  };

  return {
    form,
    validateForm,
    resetForm,
  };
};
