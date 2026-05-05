import React, { useEffect, useRef } from 'react';
import CheckMarkWhiteIcon from '@gradex/assets/icons/CheckMarkWhite.svg';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  name?: string;
  disabled?: boolean;
}

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  name?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
  inputClassName?: string;
  textClassName?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  name,
  disabled = false,
  indeterminate = false,
  className,
  inputClassName,
  textClassName = 'text-sm text-black-800',
  inputProps,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={`flex items-center gap-2 py-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className ?? ''}`}
    >
      <div className="relative flex">
        <input
          {...inputProps}
          ref={inputRef}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={`peer h-5 w-5 appearance-none rounded-[4px] border border-gray-400 transition duration-150 checked:border-green-500 checked:bg-green-500 focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed ${inputClassName ?? ''}`}
        />
        <img
          src={CheckMarkWhiteIcon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute start-1 top-1 hidden h-3 w-3 peer-checked:block"
        />
      </div>
      <span className={`${textClassName || 'text-sm text-gray-500'} `}>{label}</span>
    </label>
  );
};

export default CustomCheckbox;
