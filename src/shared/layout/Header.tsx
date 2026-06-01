import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaKey, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { clearUser } from '@gradex/redux/features/auth/authSlice';
import { selectUser } from '@gradex/redux/features/auth/authSelectors';
import profileImage from '@gradex/assets/images/profile.png';
import ArrowDownXsIcon from '@gradex/assets/icons/ArrowDownXs.svg';
import NotificationDarkIcon from '@gradex/assets/icons/NotificationDark.svg';
import SearchDarkIcon from '@gradex/assets/icons/SearchDark.svg';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';
// TODO(TEST TEAM): Temporary role switcher (remove later)
import RoleSwitcher from '@/shared/components/RoleSwitcher';
import { useLanguage } from '@/hooks/useLanguage';
import { useSchoolBranchName } from '@/hooks/useSchoolBranchName';
import CustomImage from '@/shared/components/CustomImage';
import ChangePasswordModal from '@/shared/components/ChangePasswordModal';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { name: schoolName } = useSchoolBranchName();

  const handleLogout = () => {
    dispatch(clearUser());
    navigate('/login');
  };

  const openChangePassword = () => {
    setShowDropdown(false);
    setShowChangePassword(true);
  };

  return (
    <header className="border-b border-[#DDE0E0] bg-white shadow-[0px_4px_12px_0px_#0000000A]">
      <div className="flex flex-row-reverse items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {/* TODO(TEST TEAM): Role Switcher (QA/dev) - remove later */}
          <RoleSwitcher variant="icon-only" size="md" />

          {/* Language Switcher */}
          <LanguageSwitcher variant="icon-only" size="sm" />

          {/* Notifications */}
          <div className="relative">
            <button className="flex h-10 w-10 items-center justify-center rounded-[20px] border border-[#DDE0E0] bg-[#F1F1F1] transition-colors hover:bg-black-50">
              <img src={NotificationDarkIcon} alt="" aria-hidden="true" className="h-5 w-5" />
              <span className="absolute right-1 top-3 flex h-3.5 w-[14px] items-center justify-center rounded-full bg-[#B80817] text-[10px] font-bold text-white shadow-sm">
                1
              </span>
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex h-10 items-center gap-3 rounded-[20px] border border-[#DDE0E0] bg-[#F1F1F1] px-4 py-1 transition-colors hover:bg-black-50"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#DDE0E0] bg-gray-200">
                  <CustomImage
                    src={profileImage}
                    alt="User Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-start text-start leading-tight">
                  <span className="text-xs font-medium text-[#0E1F1F]">{user?.name}</span>
                  {schoolName && (
                    <span className="text-xs font-normal text-[#646969]">{schoolName}</span>
                  )}
                </div>
              </div>
              <img
                src={ArrowDownXsIcon}
                alt=""
                aria-hidden="true"
                className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
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
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-gray-500 transition-colors hover:bg-gray-100"
                  >
                    <FaUser className="text-gray-500" />
                    <span>{t('header.profile') || 'الملف الشخصي'}</span>
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={openChangePassword}
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-gray-500 transition-colors hover:bg-gray-100"
                  >
                    <FaKey className="text-gray-500" />
                    <span>{t('header.changePassword')}</span>
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-red-500 transition-colors hover:bg-red-100"
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
              className={`w-full rounded-xl border border-[#DDE0E0] bg-white p-3 text-sm font-normal text-[#3A3A3A] placeholder:text-[#646969] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isRTL ? 'pl-4 pr-10' : 'pl-10 pr-4'
              }`}
            />
            <img
              src={SearchDarkIcon}
              alt=""
              aria-hidden="true"
              className={`absolute top-1/2 -translate-y-1/2 transform ${
                isRTL ? 'right-3' : 'left-3'
              }`}
            />
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </header>
  );
};

export default Header;
