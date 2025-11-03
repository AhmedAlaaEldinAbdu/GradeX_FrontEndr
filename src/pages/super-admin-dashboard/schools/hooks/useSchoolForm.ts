import { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { SchoolFormData } from '../types/school.types';
import { initialSchoolFormData } from '../types/school.types';
import { schoolFormSchema, getStepValidationSchema } from '../validation/school.validation';

interface FileState {
  license: File[];
  image: File[];
  certificate: File[];
}

interface FileErrors {
  license?: string;
  image?: string;
  certificate?: string;
}

interface UseSchoolFormReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<SchoolFormData, any, SchoolFormData>;
  files: FileState;
  fileErrors: FileErrors;
  handleFileUpload: (type: keyof FileState) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDelete: (type: keyof FileState, index?: number) => () => void;
  validateCurrentStep: (step: number) => Promise<boolean>;
  validateFiles: (step?: number) => boolean;
  resetForm: () => void;
  getFileNames: (type: keyof FileState) => string[];
}

/**
 * Custom hook for managing school form state with react-hook-form and yup validation
 * @param initialData - Optional initial data for edit mode
 * @returns Form methods, file state, and helper functions
 */
export const useSchoolForm = (initialData?: SchoolFormData): UseSchoolFormReturn => {
  const [files, setFiles] = useState<FileState>({
    license: [],
    image: [],
    certificate: [],
  });

  const [fileErrors, setFileErrors] = useState<FileErrors>({});

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
   * File upload handler for license, image, and certificate (supports multiple files)
   * @param type - Type of file to upload
   * @returns Change event handler
   */
  const handleFileUpload = (type: keyof FileState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];

      uploadedFiles.forEach((file) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('File size exceeds 5MB:', file.name);
          return;
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
          'image/svg+xml',
        ];
        if (!allowedTypes.includes(file.type)) {
          console.error('Invalid file type:', file.name);
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFiles((prev) => ({ ...prev, [type]: [...prev[type], ...validFiles] }));

        // Clear error for this file when uploaded
        setFileErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[type];
          return newErrors;
        });
      }
    }
  };

  /**
   * File delete handler (supports deleting specific file from multiple files)
   * @param type - Type of file to delete
   * @param index - Optional index of file to delete (for multiple files)
   * @returns Delete handler function
   */
  const handleFileDelete = (type: keyof FileState, index?: number) => () => {
    if (index !== undefined) {
      setFiles((prev) => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      }));
    } else {
      setFiles((prev) => ({ ...prev, [type]: [] }));
    }

    // Reset file input if all files are deleted
    if (index === undefined || files[type].length === 1) {
      const fileInput = document.querySelector(`input[name="${type}"]`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  /**
   * Get file names for a specific file type
   * @param type - Type of files
   * @returns Array of file names
   */
  const getFileNames = (type: keyof FileState): string[] => {
    return files[type].map((file) => file.name);
  };

  /**
   * Validate required files (license and certificate)
   * @param step - Optional step number to validate specific files for that step
   * @returns Boolean indicating if files are valid
   */
  const validateFiles = (step?: number): boolean => {
    const errors: FileErrors = {};

    // If step is provided, only validate files for that step
    if (step === 1 || step === undefined) {
      if (!files.license || files.license.length === 0) {
        errors.license = 'schools.validation.licensesRequired';
      }
    }

    if (step === 4 || step === undefined) {
      // Certificate is required on step 4
      if (!files.certificate || files.certificate.length === 0) {
        errors.certificate = 'schools.validation.certificateRequired';
      }
    }

    setFileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    form.reset(initialSchoolFormData);
    setFiles({ license: [], image: [], certificate: [] });
    setFileErrors({});
  };

  return {
    form,
    files,
    fileErrors,
    handleFileUpload,
    handleFileDelete,
    validateCurrentStep,
    validateFiles,
    resetForm,
    getFileNames,
  };
};
