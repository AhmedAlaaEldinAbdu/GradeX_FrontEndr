import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DotsIcon from '@gradex/assets/icons/Dots.svg';
import i18n from '@/i18n';
import CustomImage from '@/shared/components/CustomImage';
import type { SchoolActionKey } from '@/constants/role-access';
import { useRoleAccess } from '@/hooks/useRoleAccess';

export interface Action {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  onClick: () => void;
  hidden?: boolean;
  disabled?: boolean;
  actionKey?: SchoolActionKey;
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
  triggerClassName = 'flex items-center justify-center rounded-full bg-gray-50 p-2 hover:bg-gray-100 transition-colors',
  dropdownClassName = `absolute z-10 mt-2 w-max min-w-28 max-w-40 ${i18n.language === 'ar' ? 'max-w-40' : 'max-w-44'} rounded-lg border border-gray-200 bg-white p-1 shadow-lg`,
  // position = 'left',
  onOpen,
  onClose,
}: ActionsDropdownProps) {
  const { canPerformAction, denyAction } = useRoleAccess();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState<React.CSSProperties>({});

  // Filter out hidden actions
  const visibleActions = actions.filter((action) => !action.hidden);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const isRTL = i18n.language === 'ar';

      let top = rect.bottom + 4; // default open below

      // Calculate height of dropdown if available
      let dropdownHeight = 0;
      if (dropdownRef.current) {
        dropdownHeight = dropdownRef.current.getBoundingClientRect().height;
      } else {
        // Fallback estimation (roughly 40px per action + padding)
        dropdownHeight = visibleActions.length * 40 + 10;
      }

      // If it would go off the bottom of the screen, open upwards
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      let left: number | string = 'auto';
      let right: number | string = 'auto';

      if (isRTL) {
        left = rect.left;
        if (left < 0) left = 4;
      } else {
        right = window.innerWidth - rect.right;
        if (right < 0) right = 4;
      }

      setStyles({
        position: 'fixed',
        top: `${top}px`,
        ...(isRTL ? { left: `${left}px` } : { right: `${right}px` }),
        zIndex: 9999, // High z-index to appear over anything including modals
      });
    }
  };

  useEffect(() => {
    if (open) {
      updatePosition();
      // Second update to ensure precise size is taken after rendering
      const timeoutId = setTimeout(updatePosition, 0);

      const handleScroll = () => {
        setOpen(false);
        onClose?.();
      };

      // true parameter here ensures we capture scrolling on ANY inner container (e.g. the table)
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [open, i18n.language, onClose]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (open) {
        if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
          return; // Ignore if clicked inside trigger or dropdown
        }
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
    if (
      !canPerformAction({
        control: 'menu',
        actionKey: action.actionKey,
        actionId: action.id,
      })
    ) {
      denyAction();
      setOpen(false);
      onClose?.();
      return;
    }

    action.onClick();
    setOpen(false);
    onClose?.();
  };

  if (visibleActions.length === 0) {
    return null;
  }

  const positionClass = i18n.language === 'ar' ? 'left-0' : 'right-0';

  const menu =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={dropdownRef}
            style={styles}
            className={`${dropdownClassName.replace('absolute', 'fixed').replace('mt-2', '')} ${positionClass}`}
          >
            {visibleActions.map((action) => (
              <button
                key={action.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(action);
                }}
                disabled={action.disabled}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 ${i18n.language === 'ar' ? 'text-right' : 'text-left'} transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  action.color || 'text-gray-700 hover:bg-gray-100'
                }`}
                type="button"
              >
                {action.icon ? (
                  <CustomImage src={action.icon} alt={`${action.label} icon`} className="h-5 w-5" />
                ) : null}
                <span className="text-sm">{action.label}</span>
              </button>
            ))}
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        aria-label="Actions menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <CustomImage src={triggerIcon} alt="Options" className={`${iconClassName}`} />
      </button>

      {menu}
    </div>
  );
}
