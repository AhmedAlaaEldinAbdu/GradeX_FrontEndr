import { useEffect, useRef, useState } from 'react';
import CustomImage from '@/shared/components/CustomImage';
import CalendarGraySmIcon from '@/assets/icons/CalendarGraySm.svg';

const FILTER_FIELD_CLASS =
  'h-[38px] w-full cursor-pointer rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] ps-[13px] pe-[33px] text-sm leading-[19.6px] font-medium focus:ring-2 focus:ring-green-500 focus:outline-hidden';

const FILTER_ICON_CLASS =
  'pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2';

type FilterDateInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

export function FilterDateInput({
  value,
  onChange,
  placeholder,
  className = '',
}: FilterDateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onClick={() => {
          try {
            inputRef.current?.showPicker();
          } catch {
            // showPicker is unsupported or blocked; the native control still works.
          }
        }}
        aria-label={placeholder}
        className={`${FILTER_FIELD_CLASS} [&::-webkit-calendar-picker-indicator]:hidden ${
          value ? 'text-[#1E293B]' : 'text-transparent'
        }`}
      />
      {value ? null : (
        <span className="pointer-events-none absolute inset-y-0 start-[13px] flex items-center text-sm leading-[19.6px] font-medium whitespace-nowrap text-[#9D9D9D]">
          {placeholder}
        </span>
      )}
      <CustomImage src={CalendarGraySmIcon} alt="" className={FILTER_ICON_CLASS} />
    </div>
  );
}

export type FilterSelectOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder: string;
  iconSrc: string;
  className?: string;
};

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  iconSrc,
  className = '',
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={placeholder}
        aria-expanded={open}
        className={`${FILTER_FIELD_CLASS} flex items-center truncate text-start ${
          value ? 'text-[#1E293B]' : 'text-[#9D9D9D]'
        }`}
      >
        {selectedLabel ?? placeholder}
      </button>
      <CustomImage src={iconSrc} alt="" className={FILTER_ICON_CLASS} />

      {open && (
        <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm font-medium transition-colors hover:bg-[#F8FAFC] ${
                !value ? 'bg-[#ECFDF5] text-[#1E7A52]' : 'text-[#64748B]'
              }`}
            >
              {placeholder}
            </button>
          </li>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm font-medium transition-colors hover:bg-[#F8FAFC] ${
                  option.value === value ? 'bg-[#ECFDF5] text-[#1E7A52]' : 'text-[#1E293B]'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
