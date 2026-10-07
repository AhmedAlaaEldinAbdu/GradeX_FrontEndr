import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBars, FaKey, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { clearUser } from '@gradex/redux/features/auth/authSlice';
import { selectUser } from '@gradex/redux/features/auth/authSelectors';
import profileImage from '@gradex/assets/images/profile.png';
import BellOutlineIcon from '@gradex/assets/icons/BellOutline.svg';
import MenuKebabVerticalIcon from '@gradex/assets/icons/MenuKebabVertical.svg';
// TODO(TEST TEAM): Temporary role switcher (remove later)
import RoleSwitcher from '@/shared/components/RoleSwitcher';
import CustomImage from '@/shared/components/CustomImage';
import ChangePasswordModal from '@/shared/components/ChangePasswordModal';
import HeaderPageInfo from './HeaderPageInfo';

interface HeaderProps {
  /** Opens the mobile navigation drawer. The menu button only shows below `lg`. */
  onMenuClick?: () => void;
}

/**
 * Figma "Frame 116" (node 245:588) — 77px bar holding only the avatar, the kebab menu
 * and the notification bell, grouped at the inline-end of the page (the side away from
 * the sidebar). The kebab is the account menu trigger.
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown]);

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
      {/* Figma: 24px inline padding, 13.5px block padding around the 50px avatar -> 77px tall. */}
      <div className="flex flex-row-reverse items-center justify-between px-[16px] py-[13.5px] md:px-[24px]">
        {/* Figma "Frame 114": avatar, kebab, bell — 16px gap, reading avatar-first from the
            page edge outwards. */}
        <div className="flex shrink-0 flex-row-reverse items-center gap-[8px] sm:gap-[16px]">
          {/* Avatar with the 12px presence dot (Figma "Group 2"). */}
          <div className="relative flex h-[50px] w-[50px] shrink-0 items-center justify-center">
            <CustomImage
              src={profileImage}
              alt={user?.name ?? ''}
              className="h-full w-full rounded-[24px] object-cover"
            />
            <span
              aria-hidden
              className="absolute inset-e-[4px] bottom-0 h-[12px] w-[12px] rounded-full bg-[#22C55E]"
            />
          </div>

          {/* Account menu — Figma "iconamoon:menu-kebab-vertical-bold". */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={showDropdown}
              aria-label={t('header.profile')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] transition-colors hover:bg-[#ECFDF5]"
            >
              <img
                src={MenuKebabVerticalIcon}
                alt=""
                aria-hidden="true"
                className="h-[32px] w-[32px]"
              />
            </button>

            {/* Anchored to the button's inline-END so the menu opens towards the page centre —
                the cluster sits at the very edge of the viewport, and opening the other way
                clipped the items. */}
            {showDropdown && (
              <div
                role="menu"
                className="absolute inset-e-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[8px] border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(12,12,13,0.1),0px_4px_16px_rgba(12,12,13,0.08)]"
              >
                <div className="py-1">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to profile page if exists
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-start text-[14px] font-medium text-[#9D9D9D] transition-colors hover:bg-[#ECFDF5] hover:text-[#1E7A52]"
                  >
                    <FaUser className="shrink-0" />
                    <span>{t('header.profile')}</span>
                  </button>
                  <hr className="my-1 border-[#F1F5F9]" />
                  <button
                    role="menuitem"
                    onClick={openChangePassword}
                    className="flex w-full items-center gap-3 px-4 py-2 text-start text-[14px] font-medium text-[#9D9D9D] transition-colors hover:bg-[#ECFDF5] hover:text-[#1E7A52]"
                  >
                    <FaKey className="shrink-0" />
                    <span>{t('header.changePassword')}</span>
                  </button>
                  <hr className="my-1 border-[#F1F5F9]" />
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-start text-[14px] font-medium text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
                  >
                    <FaSignOutAlt className="shrink-0" />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications — Figma "Group 1": 32px bell offset 3px down, 14px badge at its
              top, 16px in from the bell's inline start. */}
          <button className="relative flex h-[35px] w-[32px] shrink-0 items-end justify-center rounded-[8px] transition-colors hover:bg-[#ECFDF5]">
            <img src={BellOutlineIcon} alt="" aria-hidden="true" className="h-[32px] w-[32px]" />
            <span className="absolute inset-s-[16px] top-0 flex h-[14px] w-[14px] items-center justify-center rounded-[7px] bg-[#EF4444] px-[4px] pt-px text-[10px] leading-[13px] font-medium text-white">
              1
            </span>
          </button>

          {/* TODO(TEST TEAM): Role Switcher (QA/dev) - remove later */}
          <RoleSwitcher variant="icon-only" size="md" />
        </div>

        <div className="flex min-w-0 flex-1 px-3 sm:px-4">
          <HeaderPageInfo />
        </div>

        {/* Mobile menu toggle — last child, so with flex-row-reverse it sits on the sidebar side. */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t('sidebar.expand')}
            title={t('sidebar.expand')}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px] border border-[#E2E8F0] text-[#1E293B] transition-colors hover:border-[#1E7A52] hover:bg-[#ECFDF5] hover:text-[#1E7A52] lg:hidden"
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
