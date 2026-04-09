import React from 'react';
import { useTranslation } from 'react-i18next';
import FormErrorMessage from './FormErrorMessage';

interface FormFieldProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  optional = false,
  error,
  children,
  htmlFor,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <label
        className={`mb-2 block text-start text-base font-normal text-black-800 ${required && 'required'}`}
        htmlFor={htmlFor}
      >
        {label}
        {/* {required && <span className="text-red-500">*</span>} */}
        {optional && (
          <span className="text-sm font-normal text-gray-500"> ({t('schools.optional')}) </span>
        )}
      </label>
      {children}
      {/* {error && <p className="mt-1 text-right text-xs text-red-600">{error}</p>} */}
      <FormErrorMessage message={error} />
    </div>
  );
};

export default FormField;
