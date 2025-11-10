import React from 'react';
import { useTranslation } from 'react-i18next';

type NotFoundMessageProps = {
  /** i18n translation key OR raw text */
  message?: string;
  /** Optional override text (takes precedence over message) */
  text?: string;
  /** Optional icon path */
  iconSrc?: string;
  /** Additional tailwind / css classes for wrapper */
  className?: string;
  /** Render extra actions (e.g., button to add new) */
  actions?: React.ReactNode;
};

const NotFoundMessage: React.FC<NotFoundMessageProps> = ({
  message = 'common.noDataFound',
  text,
  iconSrc,
  className,
  actions,
}) => {
  const { t } = useTranslation();
  const display = text ?? t(message);

  return (
    <div className={['py-10 text-center text-gray-500 flex flex-col items-center gap-4', className].filter(Boolean).join(' ')}>
      {iconSrc && (
        <img
          src={iconSrc}
          alt={typeof display === 'string' ? display : 'not-found-icon'}
          className="mx-auto h-20 w-20 object-contain opacity-80"
        />
      )}
      <div className="text-lg font-medium" data-testid="not-found-message">{display}</div>
      {actions && <div className="mt-2 flex items-center justify-center gap-3">{actions}</div>}
    </div>
  );
};

export default NotFoundMessage;
