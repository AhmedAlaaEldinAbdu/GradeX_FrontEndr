import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CustomImage from '@/shared/components/CustomImage';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import ChevronDownGray16Icon from '@/assets/icons/ChevronDownGray16.svg';
import CalendarAkarGrayIcon from '@/assets/icons/CalendarAkarGray.svg';
import RadioDotWhite16Icon from '@/assets/icons/RadioDotWhite16.svg';

const FIELD_BASE_CLASS =
  'w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/50 text-xs leading-[16.8px] text-[#1E293B] transition-shadow placeholder:text-[#9D9D9D] focus:ring-2 focus:ring-[#1E7A52]/30 focus:outline-hidden';

const errorBorder = (hasError: boolean) => (hasError ? 'border-red-400!' : '');

type PopupFieldProps = {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function PopupField({ name, label, required = false, error, children }: PopupFieldProps) {
  return (
    <div data-form-field={name} className="flex w-full flex-col gap-2">
      <label className="text-start text-sm leading-[19.6px] font-medium text-[black]">
        {label}
        {required ? <span className="font-bold text-[#F43F5E]">*</span> : null}
      </label>
      {children}
      <FormErrorMessage message={error} />
    </div>
  );
}

type PopupTextInputProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  inputMode?: 'numeric' | 'text';
  placeholder?: string;
};

export function PopupTextInput({
  name,
  value,
  onChange,
  onBlur,
  hasError = false,
  inputMode = 'text',
  placeholder,
}: PopupTextInputProps) {
  return (
    <input
      name={name}
      value={value}
      inputMode={inputMode}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(
          inputMode === 'numeric' ? event.target.value.replace(/\D/g, '') : event.target.value
        )
      }
      onBlur={onBlur}
      className={`${FIELD_BASE_CLASS} h-[39px] px-[17px] ${errorBorder(hasError)}`}
    />
  );
}

type PickerInputProps = {
  name: string;
  type: 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
};

export function PopupPickerInput({
  name,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  hasError = false,
  disabled = false,
}: PickerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const showIcon = type === 'date';

  return (
    <div className="relative">
      <input
        ref={inputRef}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        onClick={() => {
          try {
            inputRef.current?.showPicker();
          } catch {
            // showPicker is unsupported or blocked; the native control still works.
          }
        }}
        aria-label={placeholder}
        className={`${FIELD_BASE_CLASS} h-[38px] cursor-pointer ps-[15px] disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-calendar-picker-indicator]:hidden ${
          showIcon ? 'pe-10' : 'pe-[15px]'
        } ${value ? '' : 'text-transparent'} ${errorBorder(hasError)}`}
      />
      {!value && placeholder ? (
        <span className="pointer-events-none absolute inset-y-0 start-[15px] flex items-center text-xs leading-[16.8px] whitespace-nowrap text-[#9D9D9D]">
          {placeholder}
        </span>
      ) : null}
      {showIcon ? (
        <span className="pointer-events-none absolute end-[15px] top-1/2 flex size-4 -translate-y-1/2 items-center justify-center">
          <CustomImage src={CalendarAkarGrayIcon} alt="" />
        </span>
      ) : null}
    </div>
  );
}

export type PopupSelectOption = {
  value: string;
  label: string;
};

type PopupSelectBaseProps = {
  name: string;
  options: PopupSelectOption[];
  placeholder: string;
  hasError?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
};

type PopupSelectProps = PopupSelectBaseProps &
  (
    | { multiple?: false; value: string; onChange: (value: string) => void }
    | { multiple: true; value: string[]; onChange: (value: string[]) => void }
  );

export function PopupSelect(props: PopupSelectProps) {
  const { name, options, placeholder, hasError = false, disabled = false, onBlur } = props;
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = props.multiple ? props.value : props.value ? [props.value] : [];
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const separator = i18n.language === 'ar' ? '، ' : ', ';

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onBlur]);

  const handleSelect = (optionValue: string) => {
    if (props.multiple) {
      props.onChange(
        props.value.includes(optionValue)
          ? props.value.filter((value) => value !== optionValue)
          : [...props.value, optionValue]
      );
      return;
    }
    props.onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        name={name}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${FIELD_BASE_CLASS} flex h-[39px] items-center gap-2 px-[17px] text-start disabled:cursor-not-allowed disabled:opacity-60 ${errorBorder(hasError)}`}
      >
        <span className={`flex-1 truncate ${selectedLabels.length ? '' : 'text-[#9D9D9D]'}`}>
          {selectedLabels.length ? selectedLabels.join(separator) : placeholder}
        </span>
        <CustomImage
          src={ChevronDownGray16Icon}
          alt=""
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-multiselectable={props.multiple || undefined}
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white py-1 shadow-lg"
        >
          {options.length === 0 ? (
            <li className="px-4 py-2.5 text-start text-xs text-[#9D9D9D]">
              {t('common.noResults')}
            </li>
          ) : (
            options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-start text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#ECFDF5] text-[#1E7A52]'
                        : 'text-[#1E293B] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    {props.multiple ? (
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded border text-[10px] leading-none ${
                          isSelected
                            ? 'border-[#1E7A52] bg-[#1E7A52] text-white'
                            : 'border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isSelected ? '✓' : null}
                      </span>
                    ) : null}
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

type PopupRadioProps = {
  checked: boolean;
  label: string;
  onSelect: () => void;
};

export function PopupRadio({ checked, label, onSelect }: PopupRadioProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm leading-5 font-medium text-[black]">
      <input type="radio" className="sr-only" checked={checked} onChange={onSelect} />
      {checked ? (
        <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[#1E7A52] p-px">
          <CustomImage src={RadioDotWhite16Icon} alt="" />
        </span>
      ) : (
        <span className="size-4 shrink-0 rounded-full border border-[#CBD5E1] bg-white" />
      )}
      {label}
    </label>
  );
}
