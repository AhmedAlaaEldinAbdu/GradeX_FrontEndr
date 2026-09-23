import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ComputerLoginBanner from '@gradex/assets/illustrations/ComputerLoginBanner.svg';
import GradeXLogo from '@/assets/identity/GradeX.svg';
import { EmailSchema, type EmaileProps } from '@/validations/auth-validations';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import CustomImage from '@/shared/components/CustomImage';
import { authApiService } from '@/services/api/auth/auth.service';
import { getErrorMessage } from '@/lib/http';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, direction } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmaileProps>({
    resolver: yupResolver(EmailSchema),
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  });

  const scrollToFirstError = useScrollToFirstError<EmaileProps>();

  const onSubmit = async (data: EmaileProps) => {
    setIsLoading(true);
    setError('');

    try {
      await authApiService.forgotPassword({ email: data.email });
      // Navigate to OTP verification for password reset
      navigate('/auth/verify-otp', { state: { email: data.email, fromForgotPassword: true } });
    } catch (err) {
      setError(getErrorMessage(err) || t('common.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" dir={direction}>
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-between bg-white lg:w-1/2">
        {/* Language Toggle */}
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} p-6`}>
          <LanguageSwitcher />
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={() => navigate('/login')}
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
              <span className="text-sm font-medium">{t('login.backToLogin')}</span>
            </button>

            {/* Logo */}
            <div className="mb-8 text-center">
              {/* <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1FAD6C]">
                  <span className="text-2xl font-bold text-white">G</span>
                </div>
              </div> */}
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('login.forgotPassword')}</h1>
              <p className="text-gray-600">{t('login.resetInstructions')}</p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
              className="space-y-6 text-start"
            >
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  {t('login.emailLabel')}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`w-full rounded-lg border ${
                      error ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
                      error ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                    }`}
                    placeholder={t('login.emailInput')}
                  />
                  <div
                    className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                      isRTL ? 'left-4' : 'right-4'
                    }`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-400"
                    >
                      <path
                        d="M3.33333 5.83333L9.05544 9.86652C9.62167 10.252 10.3783 10.252 10.9446 9.86652L16.6667 5.83333M4.16667 15H15.8333C16.7538 15 17.5 14.2538 17.5 13.3333V6.66667C17.5 5.74619 16.7538 5 15.8333 5H4.16667C3.24619 5 2.5 5.74619 2.5 6.66667V13.3333C2.5 14.2538 3.24619 15 4.16667 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <FormErrorMessage message={errors?.email?.message} />
              </div>

              {error && <FormErrorMessage message={error} />}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full rounded-lg bg-[#1FAD6C] px-4 py-3 font-medium text-white transition-all hover:bg-[#178f5a] focus:outline-none focus:ring-2 focus:ring-[#1FAD6C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{t('loading.sending')}</span>
                  </div>
                ) : (
                  <span>{t('login.sendResetLink')}</span>
                )}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">{t('login.rememberPassword')}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 text-sm font-medium text-[#1FAD6C] transition-colors hover:text-[#178f5a]"
              >
                {t('login.signInButton')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="border-t border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            {isRTL
              ? '© 2024 نظام إدارة المدارس. جميع الحقوق محفوظة.'
              : '© 2024 School Management System. All rights reserved.'}
          </p>
        </div> */}
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#E6FBF5] via-[#DFF8EE] to-[#E8F9F0] lg:flex lg:items-start lg:justify-center lg:p-12">
        <div className="flex flex-col gap-24">
          <div className="flex items-center justify-center">
            <CustomImage src={GradeXLogo} alt="GradeX" className="h-[25px] w-[300px]" />
          </div>

          <div className="max-w-lg text-center">
            {/* Illustration - Lock/Key */}
            <div className="mb-8">
              <div className="mb-8">
                <CustomImage
                  src={ComputerLoginBanner}
                  alt="Login Illustration"
                  className="w-full"
                />
              </div>
            </div>

            {/* Text */}
            <h2 className="mb-4 text-3xl font-bold text-green-900">{t('login.recoverAccount')}</h2>
            <p className="text-lg text-green-900/90">{t('login.recoverDescription')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
