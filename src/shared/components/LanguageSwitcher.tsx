import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage, type Language } from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import ArrowDownXsIcon from '@gradex/assets/icons/ArrowDownXs.svg';

interface LanguageSwitcherProps {
  variant?: 'default' | 'minimal' | 'icon-only';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Which side the options list opens towards. Use `top` near the bottom of the viewport. */
  placement?: 'bottom' | 'top';
  /**
   * Render the options list in a portal, positioned against the trigger. Required inside
   * clipping containers such as the sidebar, whose `overflow-hidden` cuts the list off.
   */
  portal?: boolean;
}

/** Fixed width of the portalled list, so it can be clamped inside the viewport. */
const PORTAL_MENU_WIDTH = 200;

interface MenuCoords {
  top?: number;
  bottom?: number;
  left: number;
}

const LANGUAGE_NATIVE_NAMES: Record<Language, string> = {
  ar: 'العربية',
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
  fr: 'Français',
};

const LANGUAGE_TWEMOJI_CODE: Record<Language, string> = {
  ar: '1f1f8-1f1e6', // Saudi Arabia
  en: '1f1ec-1f1e7', // United Kingdom
  ru: '1f1f7-1f1fa', // Russia
  de: '1f1e9-1f1ea', // Germany
  fr: '1f1eb-1f1f7', // France
};

const FlagIcon: React.FC<{ lang: Language; className?: string }> = ({ lang, className }) => {
  const code = LANGUAGE_TWEMOJI_CODE[lang];

  return (
    <img
      src={`https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      className={`h-full w-full scale-[1.4] object-cover ${className ?? ''}`}
    />
  );
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'default',
  className = '',
  size = 'md',
  placement = 'bottom',
  portal = false,
}) => {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [coords, setCoords] = useState<MenuCoords | null>(null);

  // Track the trigger so the portalled list stays glued to it while the page moves.
  useEffect(() => {
    if (!open || !portal) {
      setCoords(null);
      return;
    }
    const compute = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      // Flip upward when asked to, or when the list would not fit underneath.
      const openUpward = placement === 'top' || spaceBelow < 240;
      const left = Math.min(
        Math.max(margin, rect.left + rect.width / 2 - PORTAL_MENU_WIDTH / 2),
        window.innerWidth - PORTAL_MENU_WIDTH - margin
      );
      setCoords(
        openUpward
          ? { bottom: window.innerHeight - rect.top + margin, left }
          : { top: rect.bottom + margin, left }
      );
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open, portal, placement]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // The portalled list lives outside the container, so check it separately —
      // otherwise mousedown would unmount it before the option's click fires.
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const triggerSizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-3',
  };

  const flagSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const isIconOnly = variant === 'icon-only';
  const isMinimal = variant === 'minimal';

  const baseTriggerClasses =
    'flex items-center font-medium transition-all outline-hidden border-none';

  const triggerLabel = LANGUAGE_NATIVE_NAMES[currentLanguage];

  const optionsList = (
    <ul
      ref={menuRef}
      role="listbox"
      aria-label={t('languageSwitcher.selectLanguage')}
      // Portalled into <body>, which is outside the layout's `dir` wrapper.
      dir={portal ? (isRTL ? 'rtl' : 'ltr') : undefined}
      className={
        portal
          ? 'fixed z-1000 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg'
          : `absolute z-50 min-w-[180px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${
              placement === 'top' ? 'bottom-full mb-2' : 'mt-2'
            } ${isRTL ? 'left-0' : 'right-0'}`
      }
      style={
        portal && coords
          ? { top: coords.top, bottom: coords.bottom, left: coords.left, width: PORTAL_MENU_WIDTH }
          : undefined
      }
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = lang === currentLanguage;
        return (
          <li key={lang}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                setLanguage(lang);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${
                isSelected ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <span className="inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full">
                <FlagIcon lang={lang} />
              </span>
              <span className="flex-1 text-start">{LANGUAGE_NATIVE_NAMES[lang]}</span>
              {isSelected && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 8.5L6.5 11.5L12.5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('languageSwitcher.selectLanguage')}
        title={triggerLabel}
        className={
          isIconOnly
            ? `${baseTriggerClasses} flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-full`
            : isMinimal
              ? `${baseTriggerClasses} ${triggerSizeClasses[size]}`
              : `${baseTriggerClasses} ${triggerSizeClasses[size]} rounded-full`
        }
      >
        <span
          className={`inline-flex shrink-0 overflow-hidden rounded-full ${
            isIconOnly ? 'h-full w-full' : flagSizeClasses[size]
          }`}
        >
          <FlagIcon lang={currentLanguage} />
        </span>
        {!isIconOnly && <span className="whitespace-nowrap">{triggerLabel}</span>}
        {!isIconOnly && (
          <img
            src={ArrowDownXsIcon}
            alt=""
            aria-hidden="true"
            className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && (portal ? coords && createPortal(optionsList, document.body) : optionsList)}
    </div>
  );
};

export default LanguageSwitcher;
