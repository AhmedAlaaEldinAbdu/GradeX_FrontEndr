import { useState } from 'react';
import type { SchoolFormData } from '../types/school.types';
import { initialSchoolFormData } from '../types/school.types';

interface FileState {
  logo: File | null;
  image: File | null;
  certificate: File | null;
}

export const useSchoolForm = (initialData?: SchoolFormData) => {
  const [formData, setFormData] = useState<SchoolFormData>(initialData || initialSchoolFormData);
  const [files, setFiles] = useState<FileState>({
    logo: null,
    image: null,
    certificate: null,
  });

  // Generic input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Generic checkbox change handler
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Generic radio/toggle change handler
  const handleRadioChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Nested object change handler (for applicationFeatures, facilities, etc.)
  const handleNestedChange = (
    parentKey: keyof SchoolFormData,
    childKey: string,
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as object),
        [childKey]: value,
      },
    }));
  };

  // Application features change handler
  const handleApplicationFeatureChange = (name: string, checked: boolean) => {
    handleNestedChange('applicationFeatures', name, checked);
  };

  // Facilities change handler
  const handleFacilityChange = (name: string, checked: boolean) => {
    handleNestedChange('facilities', name, checked);
  };

  // File upload handlers
  const handleFileUpload = (type: keyof FileState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  // File delete handlers
  const handleFileDelete = (type: keyof FileState) => () => {
    setFiles((prev) => ({ ...prev, [type]: null }));
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialSchoolFormData);
    setFiles({ logo: null, image: null, certificate: null });
  };

  // Set form data (for edit mode)
  const setFormDataFromServer = (data: SchoolFormData) => {
    setFormData(data);
  };

  return {
    formData,
    files,
    handleInputChange,
    handleCheckboxChange,
    handleRadioChange,
    handleApplicationFeatureChange,
    handleFacilityChange,
    handleFileUpload,
    handleFileDelete,
    resetForm,
    setFormDataFromServer,
  };
};
