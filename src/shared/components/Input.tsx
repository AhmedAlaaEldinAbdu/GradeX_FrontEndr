import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', type, ...props }, ref) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const inputRef = useRef<HTMLInputElement>(null);

    // Forward the ref to the internal input ref
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const isTimeInput = type === 'time' || type === 'datetime-local';
    const isDateInput = type === 'date';

    // For time inputs: hide native icon, show custom icon
    const showTimeIcon = isTimeInput && icon;
    const showIconAtEnd = icon && !isTimeInput && !isDateInput;

    // Hide native time picker icon
    const timeInputClasses = isTimeInput
      ? '[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden'
      : '';

    const timeIconPositionClass = isRTL ? 'left-3' : 'right-3';

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-start text-sm font-medium text-gray-700">{label}</label>
        )}
        <div className="relative">
          {/* Icon for time inputs - positioned based on language */}
          {showTimeIcon && (
            <div
              className={`absolute ${timeIconPositionClass} top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600`}
              onClick={() => {
                inputRef.current?.focus();
                inputRef.current?.showPicker?.();
              }}
            >
              {icon}
            </div>
          )}
          {/* Icon at end for regular inputs */}
          {showIconAtEnd && (
            <div
              className="absolute end-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              onClick={() => {
                inputRef.current?.focus();
                inputRef.current?.showPicker?.();
              }}
            >
              {icon}
            </div>
          )}
          <input
            ref={inputRef}
            type={type}
            onClick={() => {
              if (isTimeInput || isDateInput) {
                inputRef.current?.showPicker?.();
              }
            }}
            className={`w-full rounded-lg border px-4 py-2 transition-all placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
              showTimeIcon ? (isRTL ? 'pl-10' : 'pr-10') : ''
            } ${showIconAtEnd ? 'pr-10' : ''} ${timeInputClasses} ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-start text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
