type SubjectActiveSwitchProps = {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export default function SubjectActiveSwitch({
  checked,
  label,
  disabled = false,
  onChange,
}: SubjectActiveSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[24px] w-[44px] shrink-0 rounded-full shadow-[0px_1px_2px_rgba(12,12,13,0.1)] transition-colors focus-visible:ring-2 focus-visible:ring-[#1E7A52]/30 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? 'bg-[#1E7A52]' : 'bg-[#E2E8F0]'
      }`}
    >
      <span
        className={`absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5 rtl:-translate-x-5' : ''
        }`}
      />
    </button>
  );
}
