import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
};

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
}: ToggleSwitchProps) {
  const { i18n } = useTranslation();

  const isRTL = useMemo(() => {
    // Prefer i18n.dir() when available.
    try {
      return i18n.dir?.() === 'rtl';
    } catch {
      return (i18n.language ?? '').toLowerCase().startsWith('ar');
    }
  }, [i18n]);

  const thumbTranslateClass = isRTL
    ? checked
      ? 'translate-x-[-2px]'
      : 'translate-x-[-22px]'
    : checked
      ? 'translate-x-[22px]'
      : 'translate-x-[2px]';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onChange(!checked);
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-hidden ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${thumbTranslateClass}`}
      />
    </button>
  );
}
