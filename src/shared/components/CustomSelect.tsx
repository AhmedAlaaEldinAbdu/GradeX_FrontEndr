import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchDarkIcon from '@gradex/assets/icons/SearchDark.svg';
import CustomImage from './CustomImage';
import XmarkCircleBlackIcon from '@gradex/assets/icons/XmarkCircleBlack.svg';
import ArrowDownSmIcon from '@gradex/assets/icons/ArrowDownSm.svg';

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
  id?: string;
  variant?: 'default' | 'ghost';
  isWrap?: boolean;
  triggerClassName?: string;
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
  id = '',
  variant = 'default',
  isWrap = false,
  triggerClassName = '',
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
    !isMulti && typeof value === 'string'
      ? options.find((opt) => opt.value.toLowerCase() === value.toLowerCase())
      : null;

  const selectedOptions = isMulti
    ? options.filter((opt) =>
        selectedValues.some((v) => v.toLowerCase() === opt.value.toLowerCase())
      )
    : [];

  const filteredOptions = options.filter((option) =>
    option?.label?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  const availableOptions = isMulti
    ? filteredOptions.filter(
        (option) =>
          !selectedValues.some((v) => v.toLowerCase() === option.value.toLowerCase()) &&
          !selectedOptions.some(
            (selOpt) => selOpt.label.toLowerCase() === option.label.toLowerCase()
          )
      )
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
      const newValues = value.filter((v) => v.toLowerCase() !== optionValue.toLowerCase());
      onChange(newValues);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div id={id} ref={selectRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`h-[48px] w-full overflow-auto ${isWrap ? 'text-nowrap' : 'text-nowrap'} rounded-2xl border border-[#DDE0E0] text-sm font-normal focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${
          variant === 'ghost'
            ? 'min-h-[48px] border-0 bg-transparent px-4 py-2.5 font-normal text-[#3A3A3A] placeholder:text-[#646969] hover:bg-gray-50'
            : `min-h-[48px] w-full rounded-2xl border border-[#DDE0E0] bg-white px-3 py-2 text-sm font-normal focus:border-transparent focus:ring-2 focus:ring-green-500 ${
                error
                  ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500'
                  : 'border-gray-300 focus-within:border-transparent focus-within:ring-2 focus-within:ring-green-500'
              } ${isOpen ? 'ring-2 ring-green-500' : ''} ${disabled ? 'bg-gray-50' : 'hover:border-gray-400'}`
        } ${isRTL ? 'text-right' : 'text-left'} ${triggerClassName}`}
      >
        <div
          className={`flex flex-row${isRTL ? '-reverse' : ''} w-full items-center justify-between ${variant === 'ghost' ? 'gap-1' : 'gap-2'}`}
        >
          {/* Display selected items */}
          <div className="flex-1 overflow-hidden">
            {isMulti ? (
              selectedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center gap-1.5 rounded-lg bg-[#DFF8ED] px-2.5 py-[5px]"
                    >
                      <span className="text-sm font-normal text-[#3A3A3A]">{opt.label}</span>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveTag(opt.value, e)}
                        aria-label={`Remove ${opt.label}`}
                      >
                        <CustomImage
                          src={XmarkCircleBlackIcon}
                          alt={'close icon'}
                          className="w-20px h-20px"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-black-900">{placeholder}</span>
              )
            ) : (
              <span
                className={
                  selectedOption ? 'font-normal text-[#3A3A3A]' : 'font-light text-[#646969]'
                }
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            )}
          </div>
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-auto left-6' : 'right-6 left-auto'}`}
          >
            <CustomImage
              src={ArrowDownSmIcon}
              alt="A"
              aria-hidden="true"
              className={`${variant === 'ghost' ? 'h-2.5 w-2.5' : 'h-2.5 w-2.5'} shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${isRTL ? 'order-first' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-2xl border border-gray-300 bg-white shadow-lg"
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
                  className={`h-[40px] w-full rounded-2xl border border-[#DDE0E0] px-4 py-2 text-sm font-normal focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-hidden ${
                    isRTL ? 'pr-7 pl-4 text-right' : 'pr-4 pl-7 text-left'
                  }`}
                />
                <img
                  src={SearchDarkIcon}
                  alt=""
                  aria-hidden="true"
                  className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 ${isRTL ? 'right-2' : 'left-2'}`}
                />
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
                const isSelected =
                  !isMulti &&
                  typeof value === 'string' &&
                  option.value.toLowerCase() === value.toLowerCase();

                return (
                  <button
                    key={option.value}
                    type="button"
                    data-value={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-sm hover:bg-green-50 focus:bg-green-50 focus:outline-hidden ${
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
