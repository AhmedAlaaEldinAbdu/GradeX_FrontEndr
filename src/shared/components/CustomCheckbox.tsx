import React from 'react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  name?: string;
  disabled?: boolean;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  name,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-center gap-2 py-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <div className="relative flex">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="peer h-6 w-6 appearance-none rounded-md border border-gray-400 transition duration-150 checked:border-green-600 checked:bg-green-600 focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="white"
          className="pointer-events-none absolute left-1 top-1 hidden h-4 w-4 peer-checked:block"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 0 1 0 1.414l-8.25 8.25a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L8 12.586l7.543-7.543a1 1 0 0 1 1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

export default CustomCheckbox;
