import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import SearchDarkIcon from '@gradex/assets/icons/SearchDark.svg';
import CustomImage from './CustomImage';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // applied to input element
  iconClass?: string;
  iconSrc?: string;
  wrapperClassName?: string; // applied to outer wrapper
  debounce?: number; // ms; if provided, delays onChange calls
  disabled?: boolean;
  name?: string;
  autoFocus?: boolean;
};

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  iconClass,
  iconSrc = SearchDarkIcon,
  wrapperClassName,
  debounce = 300,
  disabled,
  name,
  autoFocus,
}) => {
  const [localValue, setLocalValue] = useState<string>(value ?? '');
  const timerRef = useRef<number | null>(null);
  const { isRTL } = useLanguage();

  useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  // Debounced change handler
  useEffect(() => {
    if (debounce <= 0) return; // no debounce, handled inline
    if (localValue === (value ?? '')) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onChange(localValue);
    }, debounce);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [localValue, value, debounce, onChange]);

  const inputClasses = useMemo(
    () =>
      className ??
      `w-full h-[48px] w-full rounded-2xl py-1 border border-[#DDE0E0] placeholder:font-light placeholder:text-[#646969] text-sm font-normal text-[#3A3A3A] focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-green-500 ${
        isRTL ? 'pl-4 pr-10' : 'pl-10 pr-4'
      }`,
    [className, isRTL]
  );

  return (
    <div className={['relative', wrapperClassName].filter(Boolean).join(' ')}>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={debounce > 0 ? localValue : value}
        onChange={(e) => {
          const v = e.target.value;
          if (debounce > 0) {
            setLocalValue(v);
          } else {
            onChange(v);
          }
        }}
        className={inputClasses}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      <CustomImage
        src={iconSrc}
        alt=""
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transform text-gray-400 ${iconClass} ${
          isRTL ? 'right-3' : 'left-3'
        }`}
        aria-hidden="true"
      />
    </div>
  );
};

export default SearchInput;
