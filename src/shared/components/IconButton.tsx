import React from 'react';
import Image from './CustomImage';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import type { SchoolActionKey } from '@/constants/role-access';
import { useRoleAccess } from '@/hooks/useRoleAccess';

type Variant = 'danger' | 'success' | 'blue' | 'darkBlue' | 'yellow' | 'default';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  status?: 'add' | 'edit' | 'delete';
  variant?: Variant;
  ariaLabel?: string;
  children?: React.ReactNode;
  imgClassName?: string;
  actionKey?: SchoolActionKey;
};

const variantClasses: Record<Variant, string> = {
  danger: 'bg-red-100 text-red-600 hover:bg-red-200',
  success: 'bg-[#30B97E]/10 text-green-600 hover:bg-green-200',
  blue: 'bg-[#E6F3FE] text-blue-600 hover:bg-blue-300',
  darkBlue: 'bg-[#0909B1]/10 text-[#0909B1] hover:bg-[#0909B1]/20',
  yellow: 'bg-[#FEF8E6] text-yellow-600 hover:bg-yellow-300',
  default: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
};

const IconButton: React.FC<IconButtonProps> = ({
  status,
  variant = 'default',
  className = 'h-[40px] w-[40px]',
  imgClassName = 'h-4 w-4',
  ariaLabel,
  disabled,
  children,
  type = 'button',
  actionKey,
  onClick,
  ...rest
}) => {
  const { canPerformAction, denyAction } = useRoleAccess();
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const iconSrc =
    status === 'add'
      ? PlusIcon
      : status === 'edit'
        ? EditIcon
        : status === 'delete'
          ? TrashIcon
          : undefined;

  const defaultVariant =
    status === 'add'
      ? variantClasses.success
      : status === 'edit'
        ? variantClasses.success
        : status === 'delete'
          ? variantClasses.danger
          : '';

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={`flex items-center justify-center rounded-full p-2 shadow-md transition-colors ${defaultVariant || variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={disabled}
      onClick={(event) => {
        if (
          !canPerformAction({
            control: 'icon-button',
            actionKey,
            buttonType: type,
            variant,
            status,
          })
        ) {
          event.preventDefault();
          event.stopPropagation();
          denyAction();
          return;
        }

        onClick?.(event);
      }}
      {...rest}
    >
      {children ? (
        children
      ) : iconSrc ? (
        <Image src={iconSrc} alt={ariaLabel} className={imgClassName} />
      ) : null}
    </button>
  );
};

export default IconButton;
