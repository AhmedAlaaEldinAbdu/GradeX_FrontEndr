import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className={`h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 ${className}`}
        {...props}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

export default Checkbox;
