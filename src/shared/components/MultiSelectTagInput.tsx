import React, { useState, useRef, useEffect } from 'react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectTagInputProps {
  value: string;
  onChange: (value: string) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const MultiSelectTagInput: React.FC<MultiSelectTagInputProps> = ({
  value,
  onChange,
  options,
  placeholder = 'اختر من القائمة',
  disabled = false,
  className = '',
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse selected values from comma-separated string
  const selectedValues = value ? value.split(',').filter((v) => v.trim()) : [];

  // Get available options (not yet selected)
  const availableOptions = options.filter((opt) => !selectedValues.includes(opt.value));

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddOption = (optionValue: string) => {
    if (optionValue && !selectedValues.includes(optionValue)) {
      const newValues = [...selectedValues, optionValue];
      onChange(newValues.join(','));
    }
    setIsOpen(false);
  };

  const handleRemoveOption = (optionValue: string) => {
    const newValues = selectedValues.filter((v) => v !== optionValue);
    onChange(newValues.join(','));
  };

  const getOptionLabel = (optionValue: string) => {
    return options.find((opt) => opt.value === optionValue)?.label || optionValue;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Field with Tags */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex min-h-[42px] w-full cursor-pointer flex-wrap items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500'
            : 'border-gray-300 focus-within:border-transparent focus-within:ring-2 focus-within:ring-green-500'
        } ${disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : 'bg-white hover:border-gray-400'}`}
      >
        {/* Selected Tags */}
        {selectedValues.length > 0 ? (
          selectedValues.map((val) => (
            <div
              key={val}
              className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-sm font-medium text-teal-800">{getOptionLabel(val)}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveOption(val);
                  }}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-800 text-white transition-colors hover:bg-teal-900"
                  aria-label={`Remove ${getOptionLabel(val)}`}
                >
                  <svg
                    className="h-2.5 w-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="text-sm text-gray-400">{placeholder}</span>
        )}

        {/* Dropdown Arrow */}
        {!disabled && availableOptions.length > 0 && (
          <div className="mr-auto flex items-center">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && availableOptions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          {availableOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleAddOption(option.value)}
              className="cursor-pointer px-4 py-2.5 text-right text-sm transition-colors hover:bg-gray-50"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* No more options message */}
      {isOpen && !disabled && availableOptions.length === 0 && selectedValues.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white p-3 text-center text-sm text-gray-500 shadow-lg">
          جميع الخيارات محددة
        </div>
      )}
    </div>
  );
};

export default MultiSelectTagInput;
