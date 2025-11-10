import React from 'react';
import { useTranslation } from 'react-i18next';

type ErrorMessageProps = {
  /** i18n translation key OR raw string */
  message?: string;
  /** Additional details or technical error text */
  details?: string | React.ReactNode;
  /** Optional icon */
  iconSrc?: string;
  /** Optional retry handler */
  onRetry?: () => void;
  /** Tailwind/CSS classes */
  className?: string;
  /** Visual emphasis */
  variant?: 'error' | 'warning';
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'common.errorOccurred',
  details,
  iconSrc,
  onRetry,
  className,
  variant = 'error',
}) => {
  const { t } = useTranslation();
  const color = variant === 'warning' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div
      className={[
        'mx-auto my-6 w-full max-w-2xl rounded-lg border px-4 py-5 text-center',
        color,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
      aria-live="assertive"
      data-testid="error-message"
    >
      <div className="flex flex-col items-center gap-3">
        {iconSrc && <img src={iconSrc} alt="error" className="h-12 w-12 opacity-80" />}
        <div className="text-base font-semibold">{t(message)}</div>
        {details && <div className="text-sm opacity-80">{details}</div>}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {t('common.retry')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
