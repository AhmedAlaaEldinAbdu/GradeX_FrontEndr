import React from 'react';
import CustomImage from '@/shared/components/CustomImage';
import type { SchoolActionKey } from '@/constants/role-access';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'outline'
    | 'secondary'
    | 'outlineSecondary'
    | 'danger'
    | 'outlineDanger'
    | 'info'
    | 'outlineInfo'
    | 'warning'
    | 'outlineWarning'
    | 'success'
    | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  imgSrc?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  imgClassName?: string;
  loading?: boolean;
  actionKey?: SchoolActionKey;
}

const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'md',
    icon,
    imgSrc,
    children,
    fullWidth = false,
    className = '',
    imgClassName = '',
    loading = false,
    disabled,
    actionKey,
    onClick,
    type = 'button',
    ...rest
  } = props;
  const { canPerformAction, denyAction } = useRoleAccess();

  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-green-500 text-white border-2 border-green-500 hover:bg-green-800 hover:border-green-800 active:bg-green-800 shadow-sm hover:shadow-md',
    outline:
      'bg-white text-green-500 border-2 border-green-500 hover:bg-green-100 active:bg-green-500 active:text-white',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    outlineSecondary:
      'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-100 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
    outlineDanger:
      'bg-white text-red-600 border-2 border-red-600 hover:bg-red-100 active:bg-red-600 active:text-white',
    info: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md',
    outlineInfo:
      'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-100 active:bg-blue-600 active:text-white',
    warning:
      'bg-[#966C03] text-white hover:bg-[#966C03]/85 active:bg-[#966C03]/85 shadow-sm hover:shadow-md',
    outlineWarning:
      'bg-white text-[#966C03] border-2 border-[#966C03] hover:bg-[#966C03]/15 active:bg-[#966C03] active:text-white',
    success:
      'bg-green-800 text-white hover:bg-green-900 active:bg-green-950 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2 text-lg',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      onClick={(event) => {
        if (
          !canPerformAction({
            control: 'button',
            actionKey,
            buttonType: type,
            variant,
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
      {loading ? (
        <svg
          className="-ml-1 mr-2 h-5 w-5 animate-spin text-current"
          xmlns="http://www.w3000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {imgSrc && <CustomImage src={imgSrc} alt="Btn Icon" className={`${imgClassName}`} />}
        </>
      )}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
