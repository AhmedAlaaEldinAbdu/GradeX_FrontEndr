import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EnterOTP from '@gradex/assets/illustrations/EnterOTP.svg';

const VerifyOtpPage: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const fromForgotPassword = location.state?.fromForgotPassword || false;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';

  //   const toggleLanguage = () => {
  //     const newLang = currentLang === 'ar' ? 'en' : 'ar';
  //     i18n.changeLanguage(newLang);
  //   };

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError(isRTL ? 'الرجاء إدخال الرمز كاملاً' : 'Please enter the complete code');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Check if coming from forgot password flow
      if (fromForgotPassword) {
        // Navigate to reset password page
        navigate('/auth/reset-password', { state: { email, verified: true } });
      } else {
        // Navigate to dashboard on success (normal login flow)
        navigate('/dashboard');
      }
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;

    setCountdown(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();

    // Simulate resend API call
    console.log('Resending OTP to:', email);
  };

  return (
    <div className="flex min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-between bg-white lg:w-1/2">
        {/* Language Toggle */}
        {/* <div className={`flex justify-${isRTL ? 'start' : 'end'} p-6`}>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-[#1FAD6C] hover:text-[#1FAD6C]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            <span>{currentLang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div> */}

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={() => navigate(fromForgotPassword ? '/auth/forgot-password' : '/login')}
              className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={isRTL ? 'rotate-180' : ''}
              >
                <path
                  d="M12.5 5L7.5 10L12.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">{isRTL ? 'العودة' : 'Back'}</span>
            </button>

            {/* Logo */}
            <div className="mb-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1FAD6C]">
                  <span className="text-2xl font-bold text-white">G</span>
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {isRTL ? 'التحقق من الرمز' : 'Verify Code'}
              </h1>
              <p className="text-gray-600">
                {isRTL ? `تم إرسال رمز التحقق إلى ${email}` : `Verification code sent to ${email}`}
              </p>
            </div>

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="mb-4 block text-center text-sm font-medium text-gray-700">
                  {isRTL
                    ? 'أدخل رمز التحقق المكون من 6 أرقام'
                    : 'Enter the 6-digit verification code'}
                </label>
                <div className="flex justify-center gap-2" dir="ltr">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`h-14 w-12 rounded-lg border text-center text-xl font-semibold transition-all focus:border-transparent focus:outline-none focus:ring-2 sm:h-16 sm:w-14 ${
                        error
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-[#1FAD6C]'
                      } ${digit ? 'border-[#1FAD6C] bg-green-50' : ''}`}
                    />
                  ))}
                </div>
                {error && <p className="mt-2 text-center text-sm text-red-500">{error}</p>}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isRTL ? 'لم تستلم الرمز؟' : "Didn't receive the code?"}
                </p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="mt-2 text-sm font-medium text-[#1FAD6C] transition-colors hover:text-[#178f5a]"
                  >
                    {isRTL ? 'إعادة إرسال الرمز' : 'Resend code'}
                  </button>
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-400">
                    {isRTL ? `إعادة الإرسال بعد ${countdown} ثانية` : `Resend in ${countdown}s`}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full rounded-lg bg-[#1FAD6C] px-4 py-3 font-medium text-white transition-all hover:bg-[#178f5a] focus:outline-none focus:ring-2 focus:ring-[#1FAD6C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{isRTL ? 'جاري التحقق...' : 'Verifying...'}</span>
                  </div>
                ) : (
                  <span>{isRTL ? 'تحقق' : 'Verify'}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            {isRTL
              ? '© 2024 نظام إدارة المدارس. جميع الحقوق محفوظة.'
              : '© 2024 School Management System. All rights reserved.'}
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#E6FBF5] via-[#DFF8EE] to-[#E8F9F0] lg:flex lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-lg text-center">
          {/* Illustration - Security/Shield */}
          <div className="mb-8">
            <div className="mb-8">
              <img src={EnterOTP} alt="Enter OTP Illustration" className="w-full" />
            </div>
          </div>

          {/* Text */}
          <h2 className="mb-4 text-3xl font-bold text-green-900">
            {isRTL ? 'حماية حسابك' : 'Secure Your Account'}
          </h2>
          <p className="text-lg text-green-900/90">
            {isRTL
              ? 'نحن نهتم بأمان بياناتك وخصوصيتها'
              : 'We care about the security and privacy of your data'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
