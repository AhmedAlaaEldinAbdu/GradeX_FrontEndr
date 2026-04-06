import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = 'sm' }) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`rounded-2xl bg-white app-card-shadow ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
