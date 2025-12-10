import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBell, FaChevronDown, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { clearUser } from '@gradex/redux/features/auth/authSlice';
import { selectUser } from '@gradex/redux/features/auth/authSelectors';
import profileImage from '@gradex/assets/images/profile.png';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';
import CustomImage from '@/shared/components/CustomImage';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(clearUser());
    navigate('/login');
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="flex flex-row-reverse items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher variant="icon-only" size="md" />

          {/* Notifications */}
          <div className="relative">
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 transition-colors hover:bg-gray-100">
              <FaBell className="text-xl text-gray-500" />
              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
                1
              </span>
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 rounded-full bg-gray-50 px-4 py-2 transition-colors hover:bg-gray-100"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                <CustomImage src={profileImage} alt="User Avatar" className="h-full w-full object-cover" />
              </div>
              <span className="text-base font-semibold text-gray-900">
                {user?.name || 'أحمد محمد'}
              </span>
              <FaChevronDown
                className={`text-sm text-gray-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to profile page if exists
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <FaUser className="text-gray-500" />
                    <span>{t('header.profile') || 'الملف الشخصي'}</span>
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>{t('header.logout') || 'تسجيل الخروج'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-md flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder={t('header.search')}
              className={`w-full rounded-lg border border-gray-300 bg-white py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isRTL ? 'pl-4 pr-10' : 'pl-10 pr-4'
              }`}
            />
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute top-1/2 -translate-y-1/2 transform text-gray-400 ${
                isRTL ? 'right-3' : 'left-3'
              }`}
            >
              <path
                d="M11 1.25C5.61522 1.25 1.25 5.61522 1.25 11C1.25 16.3848 5.61522 20.75 11 20.75C13.4226 20.75 15.6366 19.8638 17.3418 18.4014L21.4697 22.5303C21.7626 22.8232 22.2374 22.8232 22.5303 22.5303C22.8232 22.2374 22.8232 21.7626 22.5303 21.4697L18.4023 17.3408C19.8643 15.6358 20.75 13.4221 20.75 11C20.75 5.61522 16.3848 1.25 11 1.25ZM11 2.75C15.5563 2.75 19.25 6.44365 19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75Z"
                fill="#878F8F"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
