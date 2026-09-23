import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';

const PasswordResetSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Auto redirect after 5 seconds
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/login');
    }
  }, [countdown, navigate]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#1FAD6C] to-[#15885a] px-6 py-12"
      dir={direction}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33.3333 10L15 28.3333L8.33333 21.6667"
                stroke="#1FAD6C"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold text-gray-900">{t('login.passwordResetSuccess')}</h1>

        {/* Description */}
        <p className="mb-6 text-gray-600">{t('login.passwordResetSuccessMessage')}</p>

        {/* Countdown */}
        <p className="mb-6 text-sm text-gray-500">
          {t('login.redirectingToLogin', { seconds: countdown })}
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full rounded-lg bg-[#1FAD6C] px-6 py-3 font-medium text-white transition-all hover:bg-[#178f5a] focus:ring-2 focus:ring-[#1FAD6C] focus:ring-offset-2 focus:outline-hidden"
        >
          {t('login.goToLogin')}
        </button>
      </div>
    </div>
  );
};

export default PasswordResetSuccessPage;
