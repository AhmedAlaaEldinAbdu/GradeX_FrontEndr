import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ToastMessageProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function ToastMessage({
  message,
  type = 'success',
  duration = 3000,
  position,
}: ToastMessageProps) {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(true);
  const isRTL = i18n.language === 'ar';
  const finalPosition = position || (isRTL ? 'top-left' : 'top-right');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconStroke: '#1A9F58',
      icon: (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
          <path
            d="M8.66797 13.1331L10.1738 14.8541C10.5972 15.338 11.3606 15.3023 11.7371 14.7811L15.3346 9.7998"
            stroke="#1A9F58"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12.5"
            r="9"
            stroke="#1A9F58"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      iconStroke: '#DC2626',
      icon: (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
          <circle cx="12" cy="12.5" r="9" stroke="#DC2626" strokeWidth="1.5" />
          <path
            d="M9 9.5L15 15.5M15 9.5L9 15.5"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      iconStroke: '#D97706',
      icon: (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
          <circle cx="12" cy="12.5" r="9" stroke="#D97706" strokeWidth="1.5" />
          <path
            d="M12 8.5V13.5M12 16.5H12.01"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconStroke: '#2563EB',
      icon: (
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
          <circle cx="12" cy="12.5" r="9" stroke="#2563EB" strokeWidth="1.5" />
          <path
            d="M12 10.5V16.5M12 8.5H12.01"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  };

  const current = colors[type];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed z-50 flex max-w-[400px] items-center gap-2 rounded-xl border p-4 shadow-md transition-all duration-300 ${current.bg} ${current.border} ${current.text} ${finalPosition === 'top-right' ? 'right-4 top-4' : finalPosition === 'top-left' ? 'left-4 top-4' : finalPosition === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'} `}
    >
      <span>{current.icon}</span>
      <span className="font-medium">{t(`${message}`)}</span>
    </div>
  );
}
