import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResetPassword from '@gradex/assets/illustrations/ResetPassword.svg';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangePasswordSchema, type ChangePasswordProps } from '@/validations/auth-validations';
import { useForm } from 'react-hook-form';
import FormErrorMessage from '@/shared/components/FormErrorMessage';
import GradeXLogo from '@/assets/identity/GradeX.svg';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollToFirstError } from '@/hooks/useScrollToFirstError';
import CustomImage from '@/shared/components/CustomImage';
import { authApiService } from '@/services/api/auth/auth.service';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL, direction } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const token = location.state?.token || '';

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordProps>({
    resolver: yupResolver(ChangePasswordSchema),
    mode: 'onChange',
    reValidateMode: 'onSubmit',
  });

  const scrollToFirstError = useScrollToFirstError<ChangePasswordProps>();

  const onSubmit = async (data: ChangePasswordProps) => {
    setIsLoading(true);
    setError('');

    try {
      await authApiService.resetPassword({
        email,
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      navigate('/auth/password-reset-success');
    } catch {
      setError(t('common.errorOccurred'));
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
              onClick={() =>
                navigate('/auth/verify-otp', { state: { email, fromForgotPassword: true } })
              }
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
              <span className="text-sm font-medium">{t('login.back')}</span>
            </button>

            {/* Logo */}
            <div className="mb-8 text-center">
              {/* <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1FAD6C]">
                  <span className="text-2xl font-bold text-white">G</span>
                </div>
              </div> */}
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('login.changePassword')}</h1>
              {/* <p className="text-gray-600">
                {isRTL ? `إنشاء كلمة مرور جديدة لـ ${email}` : `Create a new password for ${email}`}
              </p> */}
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
              noValidate
              className="space-y-6 text-start"
            >
              {/* New Password Field */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {t('login.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    className={`w-full rounded-lg border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
                      errors.newPassword ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                    } ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder={t('login.passwordInput')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRTL ? 'left-4' : 'right-4'
                    } text-gray-400 hover:text-gray-600`}
                  >
                    {showNewPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1761_65302)">
                          <path
                            d="M7.49635 10.9966C7.49635 12.3771 8.61952 13.5002 10 13.5002C11.3806 13.5002 12.5037 12.3771 12.5037 10.9966C12.5037 9.61603 11.3806 8.49286 10 8.49286C8.61952 8.49286 7.49635 9.61603 7.49635 10.9966ZM11.327 10.9966C11.327 11.7282 10.7317 12.3235 10 12.3235C9.26837 12.3235 8.6731 11.7282 8.6731 10.9966C8.6731 10.2649 9.26837 9.66961 10 9.66961C10.7317 9.66961 11.327 10.2649 11.327 10.9966Z"
                            fill="currentColor"
                          />
                          <path
                            d="M19.8808 10.6415C19.836 10.5823 18.7649 9.17742 17.0274 7.75755C16.426 7.26618 15.8173 6.83326 15.207 6.46156L15.8237 5.60163C16.0131 5.33757 15.9525 4.96995 15.6885 4.78057C15.4244 4.59119 15.0568 4.65176 14.8675 4.91578L14.1691 5.88962C14.083 5.84718 13.9969 5.80556 13.9108 5.76571C12.7905 5.24645 11.6757 4.94481 10.5884 4.8642V3.43676C10.5884 3.11182 10.3249 2.84839 10 2.84839C9.67506 2.84839 9.41162 3.11182 9.41162 3.43676V4.86424C8.32427 4.94485 7.20946 5.24653 6.08915 5.76575C6.00313 5.8056 5.91707 5.84726 5.83093 5.88966L5.13253 4.91582C4.94319 4.65184 4.57565 4.59123 4.31147 4.78061C4.04745 4.96999 3.98689 5.33757 4.17627 5.60167L4.79296 6.4616C4.18274 6.83329 3.574 7.26622 2.97265 7.75759C1.23514 9.17742 0.164019 10.5823 0.119264 10.6415C-0.0397545 10.8515 -0.0397545 11.1417 0.119264 11.3517C0.164019 11.4108 1.2351 12.8157 2.97269 14.2356C3.99975 15.0748 5.04824 15.7449 6.08915 16.2274C7.35149 16.8124 8.60685 17.1217 9.82376 17.149C9.88233 17.1507 9.94104 17.1517 10 17.1517C10.059 17.1517 10.1177 17.1507 10.1762 17.149C11.3931 17.1217 12.6485 16.8124 13.9108 16.2274C14.9518 15.7449 16.0003 15.0747 17.0273 14.2356C18.7649 12.8157 19.836 11.4108 19.8807 11.3517C20.0398 11.1417 20.0398 10.8515 19.8808 10.6415ZM14.9785 10.9966C14.9785 13.6958 12.8191 15.9002 10.1371 15.973C10.0914 15.974 10.0458 15.975 10 15.975C9.94662 15.975 9.89343 15.9735 9.8402 15.9722C7.16882 15.8874 5.0216 13.6882 5.0216 10.9966C5.0216 8.29729 7.18102 6.09292 9.86299 6.02008C9.90861 6.01914 9.95422 6.01812 10 6.01812C10.0534 6.01812 10.1066 6.01965 10.1598 6.02095C12.8313 6.10567 14.9785 8.30498 14.9785 10.9966ZM1.34716 10.9968C1.86725 10.3835 3.05451 9.08497 4.64328 7.96776C4.13535 8.86256 3.84485 9.89622 3.84485 10.9966C3.84485 12.0975 4.13567 13.1317 4.64414 14.0268C4.31657 13.7975 4.01329 13.5654 3.73816 13.3413C2.60754 12.4205 1.76361 11.4886 1.34716 10.9968ZM15.3568 14.0254C15.8647 13.1306 16.1552 12.0969 16.1552 10.9966C16.1552 9.89559 15.8644 8.86138 15.356 7.96627C15.6835 8.19562 15.9868 8.42771 16.262 8.6518C17.3925 9.57261 18.2363 10.5044 18.6529 10.9964C18.1328 11.6096 16.9456 12.9082 15.3568 14.0254Z"
                            fill="currentColor"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1761_65302">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3L17 17M10.5 14.5C9.17 14.8 7.7 14.3 6.5 13.5C5 12.5 3.5 11 2.5 10C3.5 8.5 4.8 7 6.5 6C7.7 5.2 9.17 4.7 10.5 5M15 10.5C15.5 10 16 9.5 16.5 9C15.5 7.5 14.2 6 12.5 5C12 4.8 11.5 4.6 11 4.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <FormErrorMessage message={errors?.newPassword?.message} />

                {/* Password Strength Indicator */}
                {/* {newPassword && (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {isRTL ? 'قوة كلمة المرور' : 'Password strength'}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength < 40
                            ? 'text-red-500'
                            : passwordStrength < 70
                              ? 'text-yellow-500'
                              : 'text-green-500'
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )} */}

                {/* Password Requirements */}
                {/* <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">
                    {isRTL ? 'يجب أن تحتوي كلمة المرور على:' : 'Password must contain:'}
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li
                      className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      <span>{newPassword.length >= 8 ? '✓' : '○'}</span>
                      <span>{isRTL ? 'على الأقل 8 أحرف' : 'At least 8 characters'}</span>
                    </li>
                    <li
                      className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      <span>
                        {/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? '✓' : '○'}
                      </span>
                      <span>{isRTL ? 'أحرف كبيرة وصغيرة' : 'Upper and lowercase letters'}</span>
                    </li>
                    <li
                      className={`flex items-center gap-1 ${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      <span>{/\d/.test(newPassword) ? '✓' : '○'}</span>
                      <span>{isRTL ? 'رقم واحد على الأقل' : 'At least one number'}</span>
                    </li>
                  </ul>
                </div> */}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {t('login.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`w-full rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
                      errors.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                    } ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder={t('login.passwordInput')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRTL ? 'left-4' : 'right-4'
                    } text-gray-400 hover:text-gray-600`}
                  >
                    {showConfirmPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1761_65302)">
                          <path
                            d="M7.49635 10.9966C7.49635 12.3771 8.61952 13.5002 10 13.5002C11.3806 13.5002 12.5037 12.3771 12.5037 10.9966C12.5037 9.61603 11.3806 8.49286 10 8.49286C8.61952 8.49286 7.49635 9.61603 7.49635 10.9966ZM11.327 10.9966C11.327 11.7282 10.7317 12.3235 10 12.3235C9.26837 12.3235 8.6731 11.7282 8.6731 10.9966C8.6731 10.2649 9.26837 9.66961 10 9.66961C10.7317 9.66961 11.327 10.2649 11.327 10.9966Z"
                            fill="currentColor"
                          />
                          <path
                            d="M19.8808 10.6415C19.836 10.5823 18.7649 9.17742 17.0274 7.75755C16.426 7.26618 15.8173 6.83326 15.207 6.46156L15.8237 5.60163C16.0131 5.33757 15.9525 4.96995 15.6885 4.78057C15.4244 4.59119 15.0568 4.65176 14.8675 4.91578L14.1691 5.88962C14.083 5.84718 13.9969 5.80556 13.9108 5.76571C12.7905 5.24645 11.6757 4.94481 10.5884 4.8642V3.43676C10.5884 3.11182 10.3249 2.84839 10 2.84839C9.67506 2.84839 9.41162 3.11182 9.41162 3.43676V4.86424C8.32427 4.94485 7.20946 5.24653 6.08915 5.76575C6.00313 5.8056 5.91707 5.84726 5.83093 5.88966L5.13253 4.91582C4.94319 4.65184 4.57565 4.59123 4.31147 4.78061C4.04745 4.96999 3.98689 5.33757 4.17627 5.60167L4.79296 6.4616C4.18274 6.83329 3.574 7.26622 2.97265 7.75759C1.23514 9.17742 0.164019 10.5823 0.119264 10.6415C-0.0397545 10.8515 -0.0397545 11.1417 0.119264 11.3517C0.164019 11.4108 1.2351 12.8157 2.97269 14.2356C3.99975 15.0748 5.04824 15.7449 6.08915 16.2274C7.35149 16.8124 8.60685 17.1217 9.82376 17.149C9.88233 17.1507 9.94104 17.1517 10 17.1517C10.059 17.1517 10.1177 17.1507 10.1762 17.149C11.3931 17.1217 12.6485 16.8124 13.9108 16.2274C14.9518 15.7449 16.0003 15.0747 17.0273 14.2356C18.7649 12.8157 19.836 11.4108 19.8807 11.3517C20.0398 11.1417 20.0398 10.8515 19.8808 10.6415ZM14.9785 10.9966C14.9785 13.6958 12.8191 15.9002 10.1371 15.973C10.0914 15.974 10.0458 15.975 10 15.975C9.94662 15.975 9.89343 15.9735 9.8402 15.9722C7.16882 15.8874 5.0216 13.6882 5.0216 10.9966C5.0216 8.29729 7.18102 6.09292 9.86299 6.02008C9.90861 6.01914 9.95422 6.01812 10 6.01812C10.0534 6.01812 10.1066 6.01965 10.1598 6.02095C12.8313 6.10567 14.9785 8.30498 14.9785 10.9966ZM1.34716 10.9968C1.86725 10.3835 3.05451 9.08497 4.64328 7.96776C4.13535 8.86256 3.84485 9.89622 3.84485 10.9966C3.84485 12.0975 4.13567 13.1317 4.64414 14.0268C4.31657 13.7975 4.01329 13.5654 3.73816 13.3413C2.60754 12.4205 1.76361 11.4886 1.34716 10.9968ZM15.3568 14.0254C15.8647 13.1306 16.1552 12.0969 16.1552 10.9966C16.1552 9.89559 15.8644 8.86138 15.356 7.96627C15.6835 8.19562 15.9868 8.42771 16.262 8.6518C17.3925 9.57261 18.2363 10.5044 18.6529 10.9964C18.1328 11.6096 16.9456 12.9082 15.3568 14.0254Z"
                            fill="currentColor"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1761_65302">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3L17 17M10.5 14.5C9.17 14.8 7.7 14.3 6.5 13.5C5 12.5 3.5 11 2.5 10C3.5 8.5 4.8 7 6.5 6C7.7 5.2 9.17 4.7 10.5 5M15 10.5C15.5 10 16 9.5 16.5 9C15.5 7.5 14.2 6 12.5 5C12 4.8 11.5 4.6 11 4.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <FormErrorMessage message={errors?.confirmPassword?.message} />
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
                    <span>{t('loading.verifying')}</span>
                  </div>
                ) : (
                  <span>{t('login.changePassword')}</span>
                )}
              </button>
            </form>
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
            {/* Illustration - Password Reset */}
            <div className="mb-8">
              <div className="mb-8">
                <CustomImage
                  src={ResetPassword}
                  alt="Reset Password Illustration"
                  className="w-full"
                />
              </div>
            </div>

            {/* Text */}
            <h2 className="mb-4 text-3xl font-bold text-green-900">{t('login.strongPassword')}</h2>
            <p className="text-lg text-green-900/90">{t('login.createStrongPassword')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
