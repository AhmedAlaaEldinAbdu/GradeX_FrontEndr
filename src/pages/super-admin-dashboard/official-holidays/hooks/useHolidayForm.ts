import { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { AddHolidaysProps, AddFixedHolidayProps } from '@/validations/official-holidays-validations';
import { AddHolidaysSchema, AddFixedHolidaySchema } from '@/validations/official-holidays-validations';

interface FileState {
  [key: number]: File[];
}

interface FileErrors {
  [key: number]: string;
}

interface UseHolidayFormReturn {
  officialControl: UseFormReturn<AddHolidaysProps, any, AddHolidaysProps>;
  fixedControl: UseFormReturn<AddFixedHolidayProps, any, AddFixedHolidayProps>;
  files: FileState;
  fileErrors: FileErrors;
  handleFileUpload: (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileDelete: (index: number, fileName?: string) => () => void;
  getFileNames: (index: number) => string[];
  resetForm: () => void;
}

/**
 * Custom hook for managing holiday form state with react-hook-form and yup validation
 * @param initialOfficialData - Optional initial data for official holiday form
 * @param initialFixedData - Optional initial data for fixed holiday form
 * @returns Form methods, file state, and helper functions
 */
export const useHolidayForm = (
  initialOfficialData?: AddHolidaysProps,
  initialFixedData?: AddFixedHolidayProps
): UseHolidayFormReturn => {
  const [files, setFiles] = useState<FileState>({});
  const [fileErrors, setFileErrors] = useState<FileErrors>({});

  // Initialize official holidays form (single holiday)
  const officialControl = useForm<AddHolidaysProps>({
    resolver: yupResolver(AddHolidaysSchema) as any,
    defaultValues: initialOfficialData || {
      holidayType: '',
      startDate: '',
      endDate: '',
      country: '',
      reason: '',
      officialDocuments: [],
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  });

  // Initialize fixed holidays form (multiple holidays)
  const fixedControl = useForm<AddFixedHolidayProps>({
    resolver: yupResolver(AddFixedHolidaySchema) as any,
    defaultValues: initialFixedData || {
      holidayType: '',
      holidays: [
        {
          day: '',
          country: '',
          reason: '',
          officialDocuments: [],
        },
      ],
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  });

  // Update form values when initialData changes (for edit mode)
  useEffect(() => {
    if (initialOfficialData) {
      officialControl.reset(initialOfficialData);
    }
  }, [initialOfficialData, officialControl]);

  useEffect(() => {
    if (initialFixedData) {
      fixedControl.reset(initialFixedData);
    }
  }, [initialFixedData, fixedControl]);

  /**
   * File upload handler for holiday documents (supports multiple files)
   * @param index - Index of the holiday form (0 for dynamic, 0-n for static holidays)
   * @returns Change event handler
   */
  const handleFileUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];

      uploadedFiles.forEach((file) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('File size exceeds 5MB:', file.name);
          setFileErrors((prev) => ({
            ...prev,
            [index]: 'File size exceeds 5MB',
          }));
          return;
        }

        // Validate file type
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/pdf',
          'image/svg+xml',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedTypes.includes(file.type)) {
          console.error('Invalid file type:', file.name);
          setFileErrors((prev) => ({
            ...prev,
            [index]: 'Invalid file type',
          }));
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFiles((prev) => ({
          ...prev,
          [index]: [...(prev[index] || []), ...validFiles],
        }));

        // Clear error for this file when uploaded
        setFileErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    }
  };

  /**
   * File delete handler (supports deleting specific file from multiple files)
   * @param index - Index of the holiday form
   * @param fileName - Optional name of file to delete (for individual file deletion)
   * @returns Delete handler function
   */
  const handleFileDelete = (index: number, fileName?: string) => () => {
    if (fileName) {
      // Delete specific file by name
      setFiles((prev) => ({
        ...prev,
        [index]: (prev[index] || []).filter((file) => file.name !== fileName),
      }));
    } else {
      // Delete all files for this index
      setFiles((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }
  };

  /**
   * Get file names for a specific holiday form index
   * @param index - Index of the holiday form
   * @returns Array of file names
   */
  const getFileNames = (index: number): string[] => {
    return (files[index] || []).map((file) => file.name);
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    officialControl.reset({
      holidayType: '',
      startDate: '',
      endDate: '',
      country: '',
      reason: '',
      officialDocuments: [],
    });
    fixedControl.reset({
      holidayType: '',
      holidays: [
        {
          day: '',
          country: '',
          reason: '',
          officialDocuments: [],
        },
      ],
    });
    setFiles({});
    setFileErrors({});
  };

  return {
    officialControl,
    fixedControl,
    files,
    fileErrors,
    handleFileUpload,
    handleFileDelete,
    getFileNames,
    resetForm,
  };
};
