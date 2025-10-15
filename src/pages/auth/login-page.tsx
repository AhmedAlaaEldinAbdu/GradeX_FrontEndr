import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setUser } from '@gradex/redux/features/auth/authSlice';
import { UserRole } from '@gradex/constants';
import ComputerLoginBanner from '@gradex/assets/illustrations/ComputerLoginBanner.svg';

const LoginPage: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Language toggle
  const currentLang = i18n.language;
  const isRTL = currentLang === 'ar';

  //   const toggleLanguage = () => {
  //     const newLang = currentLang === 'ar' ? 'en' : 'ar';
  //     i18n.changeLanguage(newLang);
  //   };

  // Validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address';
    }

    if (!password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = isRTL
        ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        : 'Password must be at least 6 characters';
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
      // Mock login - dispatch user to Redux
      dispatch(
        setUser({
          id: 1,
          name: isRTL ? 'مستخدم النظام' : 'System User',
          email: email,
          role: UserRole.SUPER_ADMIN,
        })
      );

      setIsLoading(false);

      // Navigate to OTP verification
      navigate('/auth/verify-otp', { state: { email } });
    }, 1000);
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
            {/* Logo */}
            <div className="mb-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1FAD6C]">
                  <span className="text-2xl font-bold text-white">G</span>
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-start text-sm font-medium text-gray-700"
                >
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    className={`w-full rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
                      errors.email ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                    }`}
                    placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter your email'}
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
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-start text-sm font-medium text-gray-700"
                >
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                    className={`w-full rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 ${
                      errors.password ? 'focus:ring-red-500' : 'focus:ring-[#1FAD6C]'
                    } ${isRTL ? 'pl-12' : 'pr-12'}`}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isRTL ? 'left-4' : 'right-4'
                    } text-gray-400 hover:text-gray-600`}
                  >
                    {showPassword ? (
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
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1FAD6C] focus:ring-[#1FAD6C]"
                  />
                  <span className={`text-sm text-gray-700 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                    {isRTL ? 'تذكرني' : 'Remember me'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/auth/forgot-password')}
                  className="text-sm font-medium text-[#1FAD6C] transition-colors hover:text-[#178f5a]"
                >
                  {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
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
                    <span>{isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <span>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#E6FBF5] via-[#DFF8EE] to-[#E8F9F0] lg:flex lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-lg text-center">
          {/* Illustration */}
          <div className="mb-8">
            <img src={ComputerLoginBanner} alt="Login Illustration" className="w-full" />
          </div>

          {/* Text */}
          <h2 className="mb-4 text-3xl font-bold text-green-900">
            {isRTL ? 'إدارة مدرستك بسهولة' : 'Manage Your School with Ease'}
          </h2>
          <p className="text-green/90 text-lg">
            {isRTL
              ? 'نظام متكامل لإدارة جميع عمليات المدرسة بكفاءة واحترافية'
              : 'A complete system to manage all school operations efficiently and professionally'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
