import React from 'react';
import Image from './CustomImage';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

type Variant = 'danger' | 'success' | 'blue' | 'yellow' | 'default';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  status?: 'add' | 'edit' | 'delete';
  variant?: Variant;
  ariaLabel?: string;
  children?: React.ReactNode;
  imgClassName?: string;
};

const variantClasses: Record<Variant, string> = {
  danger: 'bg-red-100 text-red-600 hover:bg-red-200',
  success: 'bg-green-100 text-green-600 hover:bg-green-300',
  blue: 'bg-blue-100 text-blue-600 hover:bg-blue-300',
  yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-300',
  default: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
};

const IconButton: React.FC<IconButtonProps> = ({
  status,
  variant = 'default',
  className = '',
  imgClassName = 'h-4 w-4',
  ariaLabel,
  disabled,
  children,
  type = 'button',
  ...rest
}) => {
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
      className={`rounded-full p-2 transition-colors ${defaultVariant || variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={disabled}
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
