import React from 'react';
import GlobeIcon from '@gradex/assets/icons/Globe.svg';
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
        className={`${baseClasses} flex h-14 w-14 items-center justify-center rounded-[20px] bg-black-100 p-2 transition-colors hover:bg-black-50 ${className}`}
        aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        title={currentLanguage === 'ar' ? 'English' : 'العربية'}
      >
        <img src={GlobeIcon} alt="" aria-hidden="true" className={iconSizeClasses[size]} />
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
      <img src={GlobeIcon} alt="" aria-hidden="true" className={iconSizeClasses[size]} />
      <span>{currentLanguage === 'ar' ? 'English' : 'العربية'}</span>
    </button>
  );
};

export default LanguageSwitcher;
