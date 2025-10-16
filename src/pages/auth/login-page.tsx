import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setUser } from '@gradex/redux/features/auth/authSlice';
import { UserRole } from '@gradex/constants';
import ComputerLoginBanner from '@gradex/assets/illustrations/ComputerLoginBanner.svg';
import CustomCheckbox from '@/shared/components/CustomCheckbox';

const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();

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
              {/* <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1FAD6C]">
                  <span className="text-2xl font-bold text-white">G</span>
                </div>
              </div> */}
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('login.title')}</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-start text-sm font-medium text-gray-700"
                >
                  {t('login.emailLabel')}
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
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-start text-sm font-medium text-gray-700"
                >
                  {t('login.passwordLabel')}
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
                    placeholder={t('login.passwordInput')}
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
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <CustomCheckbox
                  name="saveLoginData"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe()}
                  label={t('login.saveLoginData')}
                />
                {/* <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#1FAD6C] focus:ring-[#1FAD6C]"
                  />
                  <span className={`text-sm text-gray-700 ${isRTL ? 'mr-2' : 'ml-2'}`}>
                    {t('login.saveLoginData')}
                  </span>
                </label> */}
                <button
                  type="button"
                  onClick={() => navigate('/auth/forgot-password')}
                  className="text-sm font-medium text-[#1FAD6C] transition-colors hover:text-[#178f5a]"
                >
                  {t('login.forgotPassword')}
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
                    {isLoading && <span>{t('login.signingIn')}</span>}
                  </div>
                ) : (
                  <span>{t('login.signInButton')}</span>
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
          <h2 className="mb-4 text-3xl font-bold text-green-900">{t('login.manageSchoolTitle')}</h2>
          <p className="text-green/90 text-lg">{t('login.manageSchoolSubtitle')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
