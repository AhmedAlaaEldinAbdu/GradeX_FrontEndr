import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FormErrorMessage from './FormErrorMessage';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxHeight?: string;
  isMulti?: boolean;
  error?: boolean;
  showSearch?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  maxHeight = '250px',
  isMulti = false,
  error = false,
  showSearch = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { i18n, t } = useTranslation();

  const isRTL = i18n.language === 'ar';

  const selectedValues = isMulti ? (Array.isArray(value) ? value : []) : [];
  const selectedOption =
    !isMulti && typeof value === 'string' ? options.find((opt) => opt.value === value) : null;

  const selectedOptions = isMulti
    ? options.filter((opt) => selectedValues.includes(opt.value))
    : [];

  const filteredOptions = options.filter((option) =>
    option?.label?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  const availableOptions = isMulti
    ? filteredOptions.filter((option) => !selectedValues.includes(option.value))
    : filteredOptions;

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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

  const handleSelect = (optionValue: string) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = [...currentValues, optionValue];
      onChange(newValues);
      setSearchQuery('');
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleRemoveTag = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      const newValues = value.filter((v) => v !== optionValue);
      onChange(newValues);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`min-h-[40px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500'
            : 'border-gray-300 focus-within:border-transparent focus-within:ring-2 focus-within:ring-green-500'
        } ${isOpen ? 'ring-2 ring-green-500' : ''} ${isRTL ? 'text-right' : 'text-left'} ${disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : 'bg-white hover:border-gray-400'}`}
      >
        <div className="flex flex-row-reverse items-center justify-between gap-2">
          {/* Display selected items */}
          <div className="flex-1 overflow-hidden">
            {isMulti ? (
              selectedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1"
                    >
                      <span className="text-sm font-medium text-teal-800">{opt.label}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTag(opt.value, e)}
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-800 text-white transition-colors hover:bg-teal-900"
                        aria-label={`Remove ${opt.label}`}
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
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-800">{placeholder}</span>
              )
            ) : (
              <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            )}
          </div>
          <svg
            className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} ${isRTL ? 'order-first' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg"
        >
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
                  className={`w-full rounded-md border border-gray-300 py-2 pl-4 pr-7 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${
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
              availableOptions.map((option) => {
                const isSelected = !isMulti && option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    data-value={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-sm hover:bg-green-50 focus:bg-green-50 focus:outline-none ${
                      isSelected ? 'bg-green-100 text-green-900' : 'text-gray-900'
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <div
                className={`px-3 py-4 text-center text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {isMulti && selectedOptions.length > 0
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

export default CustomSelect;
