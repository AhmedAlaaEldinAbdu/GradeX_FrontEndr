import React from 'react';
import CustomImage from '@/shared/components/CustomImage';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'info' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  imgSrc?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  imgClassName?: string;
  loading?: boolean;
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
    ...rest
  } = props;

  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-green-500 text-white border-2 border-green-500 hover:bg-green-800 hover:border-green-800 active:bg-green-800 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    outline:
      'bg-white text-green-500 border-2 border-green-500 hover:bg-green-100 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
    info: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md',
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
      type="button"
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
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
      <span>{children}</span>
    </button>
  );
};

export default Button;
