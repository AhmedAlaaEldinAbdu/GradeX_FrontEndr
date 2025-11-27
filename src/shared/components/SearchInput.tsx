import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // applied to input element
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
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onChange(localValue);
    }, debounce);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [localValue, debounce, onChange]);

  const inputClasses = useMemo(
    () =>
      className ??
      `h-[40px] w-full rounded-lg border border-gray-300 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 transform text-gray-400 ${
          isRTL ? 'right-3' : 'left-3'
        }`}
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
          fill="#878F8F"
        />
      </svg>
    </div>
  );
};

export default SearchInput;
