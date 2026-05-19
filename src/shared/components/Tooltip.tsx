import React from 'react';
import { useTranslation } from 'react-i18next';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** The element that triggers the tooltip on hover/focus. */
  children: React.ReactNode;
  /** Tooltip body — any node. When empty/false, only children render. */
  content: React.ReactNode;
  /** Where the tooltip appears relative to the trigger. Default: 'top'. */
  placement?: TooltipPlacement;
  /** Extra classes for the tooltip bubble (e.g. width, alignment). */
  className?: string;
  /** Extra classes for the wrapper element (e.g. sizing the trigger box). */
  wrapperClassName?: string;
  /** Inline styles for the wrapper (e.g. dynamic height for chart bars). */
  style?: React.CSSProperties;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

/**
 * Lightweight, dependency-free tooltip driven purely by Tailwind `group-hover`.
 * Content and placement are fully dynamic so it can wrap any trigger.
 */
const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  className = '',
  wrapperClassName = '',
  style,
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  if (content === null || content === undefined || content === false) {
    return <>{children}</>;
  }

  // 'left'/'right' are physical; flip them so they follow reading direction.
  const resolvedPlacement: TooltipPlacement =
    isRTL && placement === 'left' ? 'right' : isRTL && placement === 'right' ? 'left' : placement;

  return (
    <span dir={dir} className={`group relative flex flex-col ${wrapperClassName}`} style={style}>
      {children}
      <span
        role="tooltip"
        dir={dir}
        className={`pointer-events-none absolute z-20 flex flex-col justify-start whitespace-nowrap rounded-md bg-green-500 px-3 py-2 text-start text-xs text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 ${placementClasses[resolvedPlacement]} ${className}`}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
