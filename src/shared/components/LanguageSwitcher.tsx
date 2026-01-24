import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface LanguageSwitcherProps {
  /** Visual variant of the switcher */
  variant?: 'default' | 'minimal' | 'icon-only';
  /** Additional CSS classes */
  className?: string;
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Globe icon component for the language switcher
 */
const GlobeIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M2 10H18M10 2C12.5 4.5 13.5 7.5 13.5 10C13.5 12.5 12.5 15.5 10 18C7.5 15.5 6.5 12.5 6.5 10C6.5 7.5 7.5 4.5 10 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

/**
 * Language Switcher Component
 *
 * A reusable component for switching between Arabic and English languages.
 * Supports multiple visual variants and sizes.
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'default',
  className = '',
  size = 'md',
}) => {
  const { currentLanguage, toggleLanguage } = useLanguage();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-3',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const baseClasses =
    'flex items-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2';

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleLanguage}
        className={`${baseClasses} flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-green-500 ${className}`}
        aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        title={currentLanguage === 'ar' ? 'English' : 'العربية'}
      >
        <GlobeIcon className={iconSizeClasses[size]} />
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className={`${baseClasses} ${sizeClasses[size]} rounded-lg text-gray-500 hover:text-green-500 ${className}`}
        aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span>{currentLanguage === 'ar' ? 'EN' : 'عربي'}</span>
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={toggleLanguage}
      className={`${baseClasses} ${sizeClasses[size]} rounded-lg border border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 ${className}`}
      aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <GlobeIcon className={iconSizeClasses[size]} />
      <span>{currentLanguage === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
};

export default LanguageSwitcher;
