import React from 'react';
import { useTranslation } from 'react-i18next';

interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  optional = false,
  error,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <label
        className={`mb-2 block text-right text-sm font-medium text-gray-700 ${required && 'required'}`}
      >
        {label}
        {/* {required && <span className="text-red-500">*</span>} */}
        {optional && <span className="text-xs text-gray-400"> ({t('schools.optional')}) </span>}
      </label>
      {children}
      {error && <p className="mt-1 text-right text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
