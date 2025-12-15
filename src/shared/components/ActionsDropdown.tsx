import { useState, useRef, useEffect } from 'react';
import DotsIcon from '@gradex/assets/icons/Dots.svg';
import i18n from '@/i18n';
import CustomImage from '@/shared/components/CustomImage';

export interface Action {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onClick: () => void;
  hidden?: boolean;
  disabled?: boolean;
}

interface ActionsDropdownProps {
  actions: Action[];
  triggerIcon?: string;
  iconClassName?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  position?: 'left' | 'right';
  onOpen?: () => void;
  onClose?: () => void;
}

export default function ActionsDropdown({
  actions,
  triggerIcon = DotsIcon,
  iconClassName = 'h-6 w-6',
  triggerClassName = 'rounded p-1 hover:bg-gray-100',
  dropdownClassName = `absolute z-10 mt-2 w-max min-w-[7rem] max-w-[10rem] ${i18n.language === 'ar' ? 'max-w-[10rem]' : 'max-w-[11rem]'} rounded-lg border border-gray-200 bg-white p-1 shadow-lg`,
  // position = 'left',
  onOpen,
  onClose,
}: ActionsDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out hidden actions
  const visibleActions = actions.filter((action) => !action.hidden);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  const handleToggle = () => {
    if (!open) {
      onOpen?.();
    } else {
      onClose?.();
    }
    setOpen(!open);
  };

  const handleActionClick = (action: Action) => {
    action.onClick();
    setOpen(false);
    onClose?.();
  };

  if (visibleActions.length === 0) {
    return null;
  }

  const positionClass = i18n.language === 'ar' ? 'left-0' : 'right-0';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className={triggerClassName}
        onClick={handleToggle}
        aria-label="Actions menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <CustomImage src={triggerIcon} alt="Options" className={`${iconClassName}`} />
      </button>

      {open && (
        <div className={`${dropdownClassName} ${positionClass}`}>
          {visibleActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={action.disabled}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 ${i18n.language === 'ar' ? 'text-right' : 'text-left'} transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                action.color || 'text-gray-700 hover:bg-gray-100'
              }`}
              type="button"
            >
              <CustomImage src={action.icon} alt={`${action.label} icon`} className="h-5 w-5" />
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
