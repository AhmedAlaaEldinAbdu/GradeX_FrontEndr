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
  name?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  optional = false,
  error,
  children,
  htmlFor,
  name,
}) => {
  const { t } = useTranslation();

  return (
    <div data-form-field={name ?? htmlFor}>
      <label
        className={`mb-1 block text-start text-base font-normal text-black-800`}
        htmlFor={htmlFor}
      >
        <span className={`${required && 'required'}`}>{label}</span>
        {/* {required && <span className="text-red-500">*</span>} */}
        {optional && (
          <span className="text-sm font-normal text-gray-500"> ({t('schools.optional')}) </span>
        )}
        <div className="pt-2">{children}</div>
      </label>
      {/* {error && <p className="mt-1 text-right text-xs text-red-600">{error}</p>} */}
      <FormErrorMessage message={error} />
    </div>
  );
};

export default FormField;
