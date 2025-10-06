import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-lg border px-4 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
            icon ? 'pr-10' : ''
          } ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
