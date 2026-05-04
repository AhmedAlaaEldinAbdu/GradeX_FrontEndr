import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CalendarInputIcon from '@/assets/icons/CalendarInput.svg';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hidePicker?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      hidePicker = false,
      className = '',
      type,
      placeholder,
      value,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const inputRef = useRef<HTMLInputElement>(null);

    // Forward the ref to the internal input ref
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const isTimeInput = type === 'time' || type === 'datetime-local';
    const isDateInput = type === 'date';

    // Date inputs default to a CalendarInput icon if the caller doesn't pass one.
    const resolvedIcon =
      icon ?? (isDateInput ? <img src={CalendarInputIcon} alt="" className="h-5 w-5" /> : null);

    // Date inputs with a placeholder render as type="text" until the user
    // hovers/focuses, so the placeholder is visible instead of the native
    // "mm/dd/yyyy" mask. Once a value is selected we keep it as a date input.
    const isPlaceholderDate = isDateInput && !!placeholder;
    const hasValue = value !== undefined && value !== null && value !== '';
    const [isDateActive, setIsDateActive] = useState(false);
    const effectiveType = isPlaceholderDate && !isDateActive && !hasValue ? 'text' : type;

    // For time inputs: hide native icon, show custom icon
    const showTimeIcon = isTimeInput && resolvedIcon;
    const showIconAtEnd = resolvedIcon && !isTimeInput && !isDateInput;
    const showDateIcon = isDateInput && resolvedIcon;

    // Hide native time/date picker icon
    const timeInputClasses =
      isTimeInput || (isDateInput && hidePicker) || (isPlaceholderDate && showDateIcon)
        ? '[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden'
        : '';

    const timeIconPositionClass = isRTL ? 'left-3' : 'right-3';

    const openPicker = () => {
      // For placeholder-date inputs we need to switch to type="date" before
      // requesting the native picker, since showPicker() is a no-op on text.
      if (isPlaceholderDate && !isDateActive) {
        setIsDateActive(true);
        // Wait for the type to flip in the DOM before opening the picker.
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          inputRef.current?.showPicker?.();
        });
        return;
      }
      inputRef.current?.focus();
      inputRef.current?.showPicker?.();
    };

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-start text-sm font-normal text-gray-500">{label}</label>
        )}
        <div className="relative">
          {/* Icon for time/date inputs - positioned based on language */}
          {(showTimeIcon || showDateIcon) && (
            <div
              className={`absolute ${timeIconPositionClass} top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-500 hover:text-gray-600`}
              onClick={openPicker}
            >
              {resolvedIcon}
            </div>
          )}
          {/* Icon at end for regular inputs */}
          {showIconAtEnd && (
            <div
              className="absolute end-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-500 hover:text-gray-600"
              onClick={openPicker}
            >
              {resolvedIcon}
            </div>
          )}
          <input
            ref={inputRef}
            type={effectiveType}
            value={value}
            placeholder={placeholder}
            onClick={() => {
              if ((isTimeInput || isDateInput) && !hidePicker) {
                openPicker();
              }
            }}
            onFocus={(e) => {
              if (isPlaceholderDate) setIsDateActive(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              if (isPlaceholderDate && !hasValue) setIsDateActive(false);
              onBlur?.(e);
            }}
            onMouseEnter={(e) => {
              if (isPlaceholderDate) setIsDateActive(true);
              onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
              if (isPlaceholderDate && !hasValue) setIsDateActive(false);
              onMouseLeave?.(e);
            }}
            className={`h-[48px] w-full rounded-2xl border border-[#DDE0E0] px-4 py-2 text-base font-normal text-[#3A3A3A] transition-all placeholder:text-[#646969] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
              showTimeIcon || showDateIcon ? (isRTL ? 'pl-10' : 'pr-10') : ''
            } ${showIconAtEnd ? 'pr-10' : ''} ${timeInputClasses} ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-start text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
