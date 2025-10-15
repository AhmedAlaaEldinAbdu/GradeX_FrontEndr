import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PasswordResetSuccessPage: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';

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
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1FAD6C] to-[#15885a] px-6 py-12"
      dir={isRTL ? 'rtl' : 'ltr'}
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
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          {isRTL ? 'تم إعادة تعيين كلمة المرور بنجاح!' : 'Password Reset Successfully!'}
        </h1>

        {/* Description */}
        <p className="mb-6 text-gray-600">
          {isRTL
            ? 'تم تحديث كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.'
            : 'Your password has been successfully updated. You can now sign in with your new password.'}
        </p>

        {/* Countdown */}
        <p className="mb-6 text-sm text-gray-500">
          {isRTL
            ? `سيتم توجيهك إلى صفحة تسجيل الدخول خلال ${countdown} ثواني...`
            : `Redirecting to login page in ${countdown} seconds...`}
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full rounded-lg bg-[#1FAD6C] px-6 py-3 font-medium text-white transition-all hover:bg-[#178f5a] focus:outline-none focus:ring-2 focus:ring-[#1FAD6C] focus:ring-offset-2"
        >
          {isRTL ? 'الذهاب إلى تسجيل الدخول' : 'Go to Login'}
        </button>
      </div>
    </div>
  );
};

export default PasswordResetSuccessPage;
