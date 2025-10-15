import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResetPassword from '@gradex/assets/illustrations/ResetPassword.svg';

const ResetPasswordPage: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';

  //   const toggleLanguage = () => {
  //     const newLang = currentLang === 'ar' ? 'en' : 'ar';
  //     i18n.changeLanguage(newLang);
  //   };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
    if (errors.newPassword) {
      setErrors({ ...errors, newPassword: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = isRTL ? 'كلمة المرور الجديدة مطلوبة' : 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = isRTL
        ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
        : 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = isRTL
        ? 'تأكيد كلمة المرور مطلوب'
        : 'Confirm password is required';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to success page or login
      navigate('/auth/password-reset-success');
    }, 1500);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'bg-red-500';
    if (passwordStrength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength < 40) return isRTL ? 'ضعيفة' : 'Weak';
    if (passwordStrength < 70) return isRTL ? 'متوسطة' : 'Medium';
    return isRTL ? 'قوية' : 'Strong';
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
                {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
              </h1>
              <p className="text-gray-600">
                {isRTL ? `إنشاء كلمة مرور جديدة لـ ${email}` : `Create a new password for ${email}`}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 text-start">
              {/* New Password Field */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className={`w-full rounded-lg border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
                      errors.newPassword ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                    } ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
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
                        <path
                          d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10C17.5 10 15 15.5 10 15.5C5 15.5 2.5 10 2.5 10Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
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
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                )}

                {/* Password Strength Indicator */}
                {newPassword && (
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
                )}

                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
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
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: undefined });
                      }
                    }}
                    className={`w-full rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
                      errors.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                    } ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
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
                        <path
                          d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10C17.5 10 15 15.5 10 15.5C5 15.5 2.5 10 2.5 10Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
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
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[#1FAD6C] px-4 py-3 font-medium text-white transition-all hover:bg-[#178f5a] focus:outline-none focus:ring-2 focus:ring-[#1FAD6C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>{isRTL ? 'جاري التحديث...' : 'Updating...'}</span>
                  </div>
                ) : (
                  <span>{isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}</span>
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
      <div className="hidden w-1/2 bg-gradient-to-br from-[#E6FBF5] via-[#DFF8EE] to-[#E8F9F0] lg:flex lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-lg text-center">
          {/* Illustration - Password Reset */}
          <div className="mb-8">
            <div className="mb-8">
              <img src={ResetPassword} alt="Reset Password Illustration" className="w-full" />
            </div>
          </div>

          {/* Text */}
          <h2 className="mb-4 text-3xl font-bold text-green-900">
            {isRTL ? 'كلمة مرور قوية وآمنة' : 'Strong & Secure Password'}
          </h2>
          <p className="text-lg text-green-900/90">
            {isRTL
              ? 'أنشئ كلمة مرور قوية لحماية حسابك'
              : 'Create a strong password to protect your account'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
