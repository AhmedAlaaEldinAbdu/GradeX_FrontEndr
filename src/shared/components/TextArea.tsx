import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-start text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={`resize-vertical min-h-[100px] w-full rounded-2xl border border-[#DDE0E0] px-4 py-2 text-base font-normal transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-start text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default TextArea;
