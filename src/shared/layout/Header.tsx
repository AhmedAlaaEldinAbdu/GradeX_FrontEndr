import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBars, FaKey, FaSignOutAlt, FaUser } from 'react-icons/fa';
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

interface HeaderProps {
  /** Opens the mobile navigation drawer. The menu button only shows below `lg`. */
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
    <header className="bg-white drop-shadow-[0px_1px_2px_rgba(12,12,13,0.1),0px_1px_2px_rgba(12,12,13,0.05)]">
      <div className="flex flex-row-reverse items-center justify-between px-[16px] py-[16px] md:px-[24px]">
        <div className="flex shrink-0 items-center gap-[8px] sm:gap-[16px]">
          {/* TODO(TEST TEAM): Role Switcher (QA/dev) - remove later */}
          <RoleSwitcher variant="icon-only" size="md" />

          {/* Language Switcher */}
          <LanguageSwitcher variant="icon-only" size="sm" />

          {/* Notifications */}
          <div className="relative">
            {/* Figma "Group 1": 32px bell offset 3px down, 14px badge at its top, 16px in. */}
            <button className="relative flex h-[35px] w-[32px] items-end justify-center rounded-[8px] transition-colors hover:bg-[#ECFDF5]">
              <img
                src={NotificationDarkIcon}
                alt=""
                aria-hidden="true"
                className="h-[32px] w-[32px]"
              />
              <span className="absolute inset-s-[16px] top-0 flex h-[14px] w-[14px] items-center justify-center rounded-[7px] bg-[#EF4444] px-[4px] pt-px text-[10px] leading-[13px] font-medium text-white">
                1
              </span>
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-[8px] rounded-[8px] p-[4px] transition-colors hover:bg-[#ECFDF5]"
            >
              <div className="flex items-center justify-center gap-[8px]">
                <div className="relative flex h-[50px] w-[50px] items-center justify-center">
                  <CustomImage
                    src={profileImage}
                    alt="User Avatar"
                    className="h-full w-full rounded-[24px] object-cover"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-e-0 bottom-0 h-[12px] w-[12px] rounded-full border-2 border-white bg-[#22C55E]"
                  />
                </div>
                <div className="hidden flex-col items-start text-start leading-tight sm:flex">
                  <span className="text-[14px] leading-[18.2px] font-semibold text-[#1E293B]">
                    {user?.name}
                  </span>
                  {schoolName && (
                    <span className="text-[12px] leading-[15.6px] font-medium text-[#1E7A52]">
                      {schoolName}
                    </span>
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
              <div className="absolute top-full left-0 z-50 mt-2 w-48 overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(12,12,13,0.1),0px_4px_16px_rgba(12,12,13,0.08)]">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to profile page if exists
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-[14px] font-medium text-[#9D9D9D] transition-colors hover:bg-[#ECFDF5] hover:text-[#1E7A52]"
                  >
                    <FaUser className="text-[#9D9D9D]" />
                    <span>{t('header.profile') || 'الملف الشخصي'}</span>
                  </button>
                  <hr className="my-1 border-[#F1F5F9]" />
                  <button
                    onClick={openChangePassword}
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-[14px] font-medium text-[#9D9D9D] transition-colors hover:bg-[#ECFDF5] hover:text-[#1E7A52]"
                  >
                    <FaKey className="text-[#9D9D9D]" />
                    <span>{t('header.changePassword')}</span>
                  </button>
                  <hr className="my-1 border-[#F1F5F9]" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-right text-[14px] font-medium text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
                  >
                    <FaSignOutAlt className="text-[#EF4444]" />
                    <span>{t('header.logout') || 'تسجيل الخروج'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-md min-w-0 flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder={t('header.search')}
              className={`h-[42px] w-full rounded-[8px] border border-[#1E7A52] bg-white p-[8px] text-[14px] leading-[18.2px] font-semibold text-[#1E7A52] transition-colors placeholder:font-medium placeholder:text-[#9D9D9D] focus:ring-1 focus:ring-[#1E7A52] focus:outline-hidden ${
                isRTL ? 'pr-10 pl-4' : 'pr-4 pl-10'
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

        {/* Mobile menu toggle — last child, so with flex-row-reverse it sits on the sidebar side. */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t('sidebar.expand')}
            title={t('sidebar.expand')}
            className="me-[12px] flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] border border-[#E2E8F0] text-[#1E293B] transition-colors hover:border-[#1E7A52] hover:bg-[#ECFDF5] hover:text-[#1E7A52] lg:hidden"
          >
            <FaBars className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </header>
  );
};

export default Header;
