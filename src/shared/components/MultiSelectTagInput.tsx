import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  showSearch?: boolean;
  maxHeight?: string;
}

const MultiSelectTagInput: React.FC<MultiSelectTagInputProps> = ({
  value,
  onChange,
  options,
  placeholder = 'اختر من القائمة',
  disabled = false,
  className = '',
  error = false,
  showSearch = true,
  maxHeight = '240px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';

  // Parse selected values from comma-separated string
  const selectedValues = value ? value.split(',').filter((v) => v.trim()) : [];

  // Filter options by search query
  const filteredOptions = options.filter((option) =>
    option?.label?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  // Get available options (not yet selected and matching search)
  const availableOptions = filteredOptions.filter((opt) => !selectedValues.includes(opt.value));

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  const handleAddOption = (optionValue: string) => {
    if (optionValue && !selectedValues.includes(optionValue)) {
      const newValues = [...selectedValues, optionValue];
      onChange(newValues.join(','));
    }
    setSearchQuery('');
  };

  const handleRemoveOption = (optionValue: string) => {
    const newValues = selectedValues.filter((v) => v !== optionValue);
    onChange(newValues.join(','));
  };

  const getOptionLabel = (optionValue: string) => {
    return options.find((opt) => opt.value === optionValue)?.label || optionValue;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
          {/* Search Input */}
          {showSearch && (
            <div className="border-b border-gray-200 p-2">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('common.search') || 'Search...'}
                  className={`w-full rounded-md border border-gray-300 py-2 pr-7 pl-4 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-hidden ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                />
                <svg
                  className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? 'right-2' : 'left-2'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Options List */}
          <div
            className="overflow-auto"
            style={{ maxHeight: showSearch ? `calc(${maxHeight} - 60px)` : maxHeight }}
          >
            {availableOptions.length > 0 ? (
              availableOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleAddOption(option.value)}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors hover:bg-green-50 ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className={`px-3 py-4 text-center text-sm text-gray-500`}>
                {selectedValues.length > 0
                  ? t('common.noMoreOptions') || 'All options selected'
                  : t('common.noResults') || 'No results found'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectTagInput;
