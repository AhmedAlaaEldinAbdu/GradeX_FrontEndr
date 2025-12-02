import React from 'react';
import { useTranslation } from 'react-i18next';

interface FormErrorMessageProps {
  message?: string;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message }) => {
  const { t } = useTranslation();

  if (!message) return null;

  return (
    <div className="flex">
      <p className="mt-1 text-start text-sm text-red-500">{t(message)}</p>
    </div>
  );
};

export default FormErrorMessage;
