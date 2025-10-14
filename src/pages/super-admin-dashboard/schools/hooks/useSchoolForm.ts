import { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { SchoolFormData } from '../types/school.types';
import { initialSchoolFormData } from '../types/school.types';
import { schoolFormSchema, getStepValidationSchema } from '../validation/school.validation';

interface FileState {
  logo: File | null;
  image: File | null;
  certificate: File | null;
}

interface UseSchoolFormReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<SchoolFormData, any, SchoolFormData>;
  files: FileState;
  handleFileUpload: (type: keyof FileState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDelete: (type: keyof FileState) => () => void;
  validateCurrentStep: (step: number) => Promise<boolean>;
  resetForm: () => void;
}

/**
 * Custom hook for managing school form state with react-hook-form and yup validation
 * @param initialData - Optional initial data for edit mode
 * @returns Form methods, file state, and helper functions
 */
export const useSchoolForm = (initialData?: SchoolFormData): UseSchoolFormReturn => {
  const [files, setFiles] = useState<FileState>({
    logo: null,
    image: null,
    certificate: null,
  });

  // Initialize react-hook-form with yup resolver
  const form = useForm<SchoolFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schoolFormSchema) as any, // Type assertion for yup compatibility
    defaultValues: initialData || initialSchoolFormData,
    mode: 'onTouched', // Only validate after user interacts with field
    reValidateMode: 'onChange', // Re-validate on change after first validation
    criteriaMode: 'firstError', // Show only first error per field
  });

  // Update form values when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  /**
   * Validate specific step before proceeding to next step
   * @param step - Current step number (1-4)
   * @returns Promise resolving to validation result
   */
  const validateCurrentStep = async (step: number): Promise<boolean> => {
    const schema = getStepValidationSchema(step);
    const currentValues = form.getValues();

    try {
      await schema.validate(currentValues, { abortEarly: false });
      return true;
    } catch {
      // Set errors for all fields in the current step
      const formValues = form.getValues();
      const fieldsToValidate = Object.keys(formValues).filter(() => {
        // Only validate fields that belong to the current step
        return true; // This will trigger validation for all fields
      });

      // Trigger validation for step fields
      await form.trigger(fieldsToValidate as Array<keyof SchoolFormData>);
      return false;
    }
  };

  /**
   * File upload handler for logo, image, and certificate
   * @param type - Type of file to upload
   * @returns Change event handler
   */
  const handleFileUpload = (type: keyof FileState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File size exceeds 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        console.error('Invalid file type');
        return;
      }

      setFiles((prev) => ({ ...prev, [type]: file }));
    }
  };

  /**
   * File delete handler
   * @param type - Type of file to delete
   * @returns Delete handler function
   */
  const handleFileDelete = (type: keyof FileState) => () => {
    setFiles((prev) => ({ ...prev, [type]: null }));

    // Reset file input if needed
    const fileInput = document.querySelector(`input[name="${type}"]`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    form.reset(initialSchoolFormData);
    setFiles({ logo: null, image: null, certificate: null });
  };

  return {
    form,
    files,
    handleFileUpload,
    handleFileDelete,
    validateCurrentStep,
    resetForm,
  };
};
