import React from 'react';
import CustomImage from '@/shared/components/CustomImage';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  imgSrc?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  imgClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  imgSrc,
  children,
  fullWidth = false,
  className = '',
  imgClassName = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-green-500 text-white border-2 border-green-500 hover:bg-green-800 hover:border-green-800 active:bg-green-800 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    outline:
      'bg-white text-green-500 border-2 border-green-500 hover:bg-green-100 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {imgSrc && <CustomImage src={imgSrc} alt="Btn Icon" className={`${imgClassName}`} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
