import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    success: 'bg-green-100 text-green-500',
    warning: 'bg-yellow-100 text-yellow-500',
    danger: 'bg-red-100 text-red-500',
    info: 'bg-blue-100 text-blue-500',
    default: 'bg-gray-100 text-gray-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-5 py-2 text-md',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
};

export default Badge;
