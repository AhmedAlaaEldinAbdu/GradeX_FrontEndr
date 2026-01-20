import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { UserRole, type UserRoleType } from 'src/constants';
import CustomImage from '@/shared/components/CustomImage';

// Import icons
import HomeIcon from 'src/assets/icons/Home.svg';
import BookIcon from 'src/assets/icons/Book.svg';
import BusIcon from 'src/assets/icons/Bus.svg';
import CalendarIcon from 'src/assets/icons/Calendar.svg';
import EducationIcon from 'src/assets/icons/Education.svg';
import NotificationIcon from 'src/assets/icons/Notification.svg';
import PeopleRegularIcon from 'src/assets/icons/PeopleRegular.svg';
import PeopleSolidIcon from 'src/assets/icons/PeopleSolid.svg';
import TicketsIcon from 'src/assets/icons/Tickets.svg';
import ReportIcon from 'src/assets/icons/Report.svg';
import ReportsIcon from 'src/assets/icons/Reports.svg';
import SettingsIcon from 'src/assets/icons/Settings.svg';
import StudentsIcon from 'src/assets/icons/Students.svg';
import WalletIcon from 'src/assets/icons/Wallet.svg';
import ChevronDown from 'src/assets/icons/ChevronDown.svg';
import ChevronUp from 'src/assets/icons/ChevronUp.svg';
import ContactIcon from 'src/assets/icons/Contact.svg';
import SchoolRegularIcon from 'src/assets/icons/SchoolRegular.svg';
import MainLogo from 'src/assets/identity/MainLogo.webp';

interface SidebarProps {
  dashboardType: UserRoleType;
  customMenuItems?: MenuItem[];
}

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { key: string; path: string; icon?: React.ReactNode }[];
}

/**
 * Get menu items for Super Admin Dashboard
 */
const getSuperAdminMenuItems = (): MenuItem[] => [
  {
    key: 'home',
    icon: <CustomImage src={HomeIcon} className="h-5 w-5" alt="Home" />,
    path: '/dashboard',
  },
  {
    key: 'academicSystem',
    icon: <CustomImage src={EducationIcon} className="h-5 w-5" alt="Academic System" />,
    path: '/academic-system',
  },
  {
    key: 'schools',
    icon: <CustomImage src={SchoolRegularIcon} className="h-5 w-5" alt="Schools" />,
    path: '/schools',
  },
  {
    key: 'officialHolidays',
    icon: <CustomImage src={BookIcon} className="h-5 w-5" alt="Official Holidays" />,
    path: '/official-holidays',
  },
  {
    key: 'marketing',
    icon: <CustomImage src={PeopleRegularIcon} className="h-5 w-5" alt="Marketing" />,
    path: '/marketing',
  },
  {
    key: 'employeesAdministration',
    icon: <CustomImage src={ContactIcon} className="h-5 w-5" alt="Employees & Administration" />,
    subItems: [
      {
        key: 'rolesPermissions',
        path: '/employees-administration/roles-permissions',
        icon: <CustomImage src={ContactIcon} className="h-5 w-5" alt="Roles & Permissions" />,
      },
      {
        key: 'systemUsers',
        path: '/employees-administration/system-users',
        icon: <CustomImage src={ContactIcon} className="h-5 w-5" alt="System Users" />,
      },
    ],
  },
  {
    key: 'reports',
    icon: <CustomImage src={ReportsIcon} className="h-5 w-5" alt="Reports" />,
    path: '/reports',
  },
  {
    key: 'tickets',
    icon: <CustomImage src={TicketsIcon} className="h-5 w-5" alt="Tickets" />,
    path: '/tickets',
  },
  {
    key: 'notifications',
    icon: <CustomImage src={NotificationIcon} className="h-5 w-5" alt="Notifications" />,
    path: '/notifications',
  },
  {
    key: 'messages',
    icon: <CustomImage src={SettingsIcon} className="h-5 w-5" alt="Messages" />,
    path: '/messages',
  },
  {
    key: 'settings',
    icon: <CustomImage src={SettingsIcon} className="h-5 w-5" alt="Settings" />,
    path: '/settings',
  },
];

/**
 * Get menu items for School Admin Dashboard
 */
const getSchoolAdminMenuItems = (): MenuItem[] => [
  {
    key: 'home',
    icon: <CustomImage src={HomeIcon} className="h-5 w-5" alt="Home" />,
    path: '/dashboard',
  },
  {
    key: 'educationalStages',
    icon: <CustomImage src={EducationIcon} className="h-5 w-5" alt="Education" />,
    subItems: [
      { key: 'classrooms', path: '/classrooms' },
      { key: 'subjects', path: '/subjects' },
    ],
  },
  {
    key: 'books',
    icon: <CustomImage src={BookIcon} className="h-5 w-5" alt="Books" />,
    path: '/books',
  },
  {
    key: 'teachingStaff',
    icon: <CustomImage src={PeopleRegularIcon} className="h-5 w-5" alt="Teaching Staff" />,
    subItems: [
      { key: 'teachers', path: '/teachers' },
      { key: 'jobAnnouncements', path: '/job-announcements' },
      { key: 'interviews', path: '/interviews' },
    ],
  },
  {
    key: 'calendarManagement',
    icon: <CustomImage src={CalendarIcon} className="h-5 w-5" alt="Calendar" />,
    subItems: [
      { key: 'tasks', path: '/calendar/tasks' },
      { key: 'preparations', path: '/calendar/preparations' },
      { key: 'weeklyCalendar', path: '/calendar/weekly' },
      { key: 'monthlyCalendar', path: '/calendar/monthly' },
      { key: 'academicCalendar', path: '/calendar/academic' },
    ],
  },
  {
    key: 'studentManagement',
    icon: <CustomImage src={StudentsIcon} className="h-5 w-5" alt="Students" />,
    subItems: [
      {
        key: 'students',
        path: '/students',
        icon: <CustomImage src={PeopleSolidIcon} className="h-5 w-5" alt="Students List" />,
      },
      {
        key: 'attendanceRequests',
        path: '/attendance-requests',
        icon: <CustomImage src={ReportIcon} className="h-5 w-5" alt="Requests" />,
      },
    ],
  },
  {
    key: 'attendance',
    icon: <CustomImage src={TicketsIcon} className="h-5 w-5" alt="Attendance" />,
    path: '/attendance',
  },
  {
    key: 'fees',
    icon: <CustomImage src={WalletIcon} className="h-5 w-5" alt="Fees" />,
    path: '/fees',
  },
  {
    key: 'busManagement',
    icon: <CustomImage src={BusIcon} className="h-5 w-5" alt="Bus Management" />,
    path: '/bus-management',
  },
  {
    key: 'notifications',
    icon: <CustomImage src={NotificationIcon} className="h-5 w-5" alt="Notifications" />,
    path: '/notifications',
  },
  {
    key: 'reports',
    icon: <CustomImage src={ReportsIcon} className="h-5 w-5" alt="Reports" />,
    path: '/reports',
  },
  {
    key: 'settings',
    icon: <CustomImage src={SettingsIcon} className="h-5 w-5" alt="Settings" />,
    path: '/settings',
  },
];

/**
 * Get menu items based on dashboard type
 */
const getMenuItemsForDashboard = (dashboardType: UserRoleType): MenuItem[] => {
  switch (dashboardType) {
    case UserRole.SUPER_ADMIN:
      return getSuperAdminMenuItems();
    case UserRole.SCHOOL_ADMIN:
      return getSchoolAdminMenuItems();
    // Add more dashboard types as needed
    default:
      return getSchoolAdminMenuItems(); // Default to school admin
  }
};

/**
 *  Sidebar Component
 *
 * Renders different menu items based on the dashboard type
 * This allows the same sidebar component to work for all dashboard types
 */
const Sidebar: React.FC<SidebarProps> = ({ dashboardType, customMenuItems }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get menu items based on dashboard type or use custom items
  const menuItems = customMenuItems || getMenuItemsForDashboard(dashboardType);

  // Auto-expand parent menu item when visiting a sub-item URL
  useEffect(() => {
    const currentPath = location.pathname;
    let shouldExpandKey: string | null = null;

    // Find if current path matches any sub-item or starts with a sub-item path
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isSubItemActive = item.subItems.some(
          (subItem) => currentPath === subItem.path || currentPath.startsWith(subItem.path + '/')
        );

        if (isSubItemActive) {
          shouldExpandKey = item.key;
        }
      }
    });

    setExpandedItems((prev) => {
      if (shouldExpandKey) {
        return prev.includes(shouldExpandKey) ? prev : [shouldExpandKey];
      } else {
        return [];
      }
    });
    // eslint-disable-next-line
  }, [location.pathname]);

  const toggleExpand = (key: string, firstSubItemPath?: string) => {
    const isCurrentlyExpanded = expandedItems.includes(key);

    if (isCurrentlyExpanded) {
      setExpandedItems((prev) => prev.filter((item) => item !== key));
    } else {
      setExpandedItems([key]);
      if (firstSubItemPath) {
        navigate(firstSubItemPath);
      }
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const isExpanded = expandedItems.includes(item.key);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    // Check if any sub-item is active (exact match or nested route)
    const isAnySubItemActive =
      hasSubItems &&
      item.subItems?.some(
        (subItem) =>
          location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')
      );

    if (hasSubItems) {
      const firstSubItemPath = item.subItems?.[0]?.path;

      return (
        <div
          key={item.key}
          className={`mb-1 ${isExpanded ? 'rounded-lg bg-green-50' : ''}`}
          style={
            isExpanded ? { borderRadius: isRTL ? '20px 0 0 20px' : '0 20px 20px 0' } : undefined
          }
        >
          <button
            onClick={() => toggleExpand(item.key, firstSubItemPath)}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200 ${
              isAnySubItemActive
                ? 'bg-green-700 font-semibold text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ borderRadius: isRTL ? '20px 0 0 20px' : '0 20px 20px 0' }}
          >
            <div className="flex items-center gap-3">
              <span
                className={isAnySubItemActive ? 'text-white' : 'text-gray-700'}
                style={
                  isAnySubItemActive
                    ? {
                        filter: 'brightness(0) saturate(100%) invert(1)',
                      }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{t(`sidebar.${item.key}`)}</span>
            </div>
            <span className={isAnySubItemActive ? 'text-white' : 'text-gray-700'}>
              {isExpanded ? (
                <CustomImage
                  src={ChevronUp}
                  className="h-5 w-5"
                  alt="Collapse"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(1)',
                  }}
                />
              ) : (
                <CustomImage
                  src={ChevronDown}
                  className="h-5 w-5"
                  alt="Expand"
                  style={
                    isAnySubItemActive
                      ? {
                          filter: 'brightness(0) saturate(100%) invert(1)',
                        }
                      : undefined
                  }
                />
              )}
            </span>
          </button>
          {isExpanded && (
            <div className="space-y-0">
              {item.subItems?.map((subItem) => {
                // Check if sub-item is active (exact match or nested route)
                const isSubItemActive =
                  location.pathname === subItem.path ||
                  location.pathname.startsWith(subItem.path + '/');
                return (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 ${
                        isActive || isSubItemActive
                          ? 'bg-green-100 font-semibold text-green-800'
                          : 'hover:bg-green-75 text-green-700'
                      }`
                    }
                  >
                    {subItem.icon && (
                      <span className={isSubItemActive ? 'text-green-800' : 'text-green-700'}>
                        {subItem.icon}
                      </span>
                    )}
                    <span>{t(`sidebar.${subItem.key}`)}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.key}
        to={item.path!}
        onClick={() => setExpandedItems([])}
        className={({ isActive }) =>
          `mb-1 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
            isActive
              ? 'bg-green-700 font-medium text-white'
              : 'text-gray-700 hover:bg-gray-50 hover:text-green-700'
          }`
        }
        style={{ borderRadius: isRTL ? '20px 0 0 20px' : '0 20px 20px 0' }}
      >
        {({ isActive }) => (
          <>
            <span
              style={
                isActive
                  ? {
                      filter: 'brightness(0) saturate(100%) invert(1)',
                    }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{t(`sidebar.${item.key}`)}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white shadow-lg">
      {/* Sidebar Header */}
      <div className="h-[96px] border-gray-200 px-6 py-4">
        {/* <h1 className="text-center text-2xl font-bold text-gray-800">Logo</h1> */}
        <CustomImage src={MainLogo} alt="Logo" className="mx-auto h-[65px] w-auto" />
      </div>

      {/* Navigation Menu */}
      <nav className={`scrollbar-thin flex-1 overflow-y-auto ${isRTL ? 'pl-4' : 'pr-4'}`}>
        {menuItems.map(renderMenuItem)}
      </nav>
    </aside>
  );
};

export default Sidebar;
