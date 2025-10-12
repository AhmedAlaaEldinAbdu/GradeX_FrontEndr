import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  optional = false,
  children,
}) => {
  return (
    <div>
      <label className="mb-2 block text-right text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-xs text-gray-400">(اختياري)</span>}
      </label>
      {children}
    </div>
  );
};

export default FormField;
