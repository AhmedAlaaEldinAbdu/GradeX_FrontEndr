import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { UserRole, type UserRoleType } from '@gradex/constants';

// Import icons
import HomeIcon from '@gradex/assets/icons/Home.svg';
import BookIcon from '@gradex/assets/icons/Book.svg';
import BusIcon from '@gradex/assets/icons/Bus.svg';
import CalendarIcon from '@gradex/assets/icons/Calendar.svg';
import EducationIcon from '@gradex/assets/icons/Education.svg';
import NotificationIcon from '@gradex/assets/icons/Notification.svg';
import PeopleRegularIcon from '@gradex/assets/icons/PeopleRegular.svg';
import PeopleSolidIcon from '@gradex/assets/icons/PeopleSolid.svg';
import TicketsIcon from '@gradex/assets/icons/Tickets.svg';
import ReportIcon from '@gradex/assets/icons/Report.svg';
import ReportsIcon from '@gradex/assets/icons/Reports.svg';
import SettingsIcon from '@gradex/assets/icons/Settings.svg';
import StudentsIcon from '@gradex/assets/icons/Students.svg';
import WalletIcon from '@gradex/assets/icons/Wallet.svg';
import ChevronDown from '@gradex/assets/icons/ChevronDown.svg';
import ChevronUp from '@gradex/assets/icons/ChevronUp.svg';
import ContactIcon from '@gradex/assets/icons/Contact.svg';
import SchoolRegularIcon from '@gradex/assets/icons/SchoolRegular.svg';

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
    icon: <img src={HomeIcon} className="h-5 w-5" alt="Home" />,
    path: '/dashboard',
  },
  {
    key: 'academicSystem',
    icon: <img src={EducationIcon} className="h-5 w-5" alt="Academic System" />,
    path: '/academic-system',
  },
  {
    key: 'schools',
    icon: <img src={SchoolRegularIcon} className="h-5 w-5" alt="Schools" />,
    path: '/schools',
  },
  {
    key: 'officialHolidays',
    icon: <img src={BookIcon} className="h-5 w-5" alt="Official Holidays" />,
    path: '/official-holidays',
  },
  {
    key: 'marketing',
    icon: <img src={PeopleRegularIcon} className="h-5 w-5" alt="Marketing" />,
    path: '/marketing',
  },
  {
    key: 'employeesAdministration',
    icon: <img src={ContactIcon} className="h-5 w-5" alt="Employees & Administration" />,
    subItems: [
      {
        key: 'rolesPermissions',
        path: '/employees-administration/roles-permissions',
        icon: <img src={ContactIcon} className="h-5 w-5" alt="Roles & Permissions" />,
      },
      {
        key: 'systemUsers',
        path: '/employees-administration/system-users',
        icon: <img src={ContactIcon} className="h-5 w-5" alt="System Users" />,
      },
    ],
  },
  {
    key: 'reports',
    icon: <img src={ReportsIcon} className="h-5 w-5" alt="Reports" />,
    path: '/reports',
  },
  {
    key: 'tickets',
    icon: <img src={TicketsIcon} className="h-5 w-5" alt="Tickets" />,
    path: '/tickets',
  },
  {
    key: 'notifications',
    icon: <img src={NotificationIcon} className="h-5 w-5" alt="Notifications" />,
    path: '/notifications',
  },
  {
    key: 'messages',
    icon: <img src={SettingsIcon} className="h-5 w-5" alt="Messages" />,
    path: '/messages',
  },
  {
    key: 'settings',
    icon: <img src={SettingsIcon} className="h-5 w-5" alt="Settings" />,
    path: '/settings',
  },
];

/**
 * Get menu items for School Admin Dashboard
 */
const getSchoolAdminMenuItems = (): MenuItem[] => [
  {
    key: 'home',
    icon: <img src={HomeIcon} className="h-5 w-5" alt="Home" />,
    path: '/dashboard',
  },
  {
    key: 'educationalStages',
    icon: <img src={EducationIcon} className="h-5 w-5" alt="Education" />,
    subItems: [{ key: 'educationalStages', path: '/educational-stages' }],
  },
  {
    key: 'books',
    icon: <img src={BookIcon} className="h-5 w-5" alt="Books" />,
    path: '/books',
  },
  {
    key: 'teachingStaff',
    icon: <img src={PeopleRegularIcon} className="h-5 w-5" alt="Teaching Staff" />,
    subItems: [{ key: 'teachingStaff', path: '/teaching-staff' }],
  },
  {
    key: 'academicCalendar',
    icon: <img src={CalendarIcon} className="h-5 w-5" alt="Calendar" />,
    path: '/academic-calendar',
  },
  {
    key: 'studentManagement',
    icon: <img src={StudentsIcon} className="h-5 w-5" alt="Students" />,
    subItems: [
      {
        key: 'students',
        path: '/students',
        icon: <img src={PeopleSolidIcon} className="h-5 w-5" alt="Students List" />,
      },
      {
        key: 'attendanceRequests',
        path: '/attendance-requests',
        icon: <img src={ReportIcon} className="h-5 w-5" alt="Requests" />,
      },
    ],
  },
  {
    key: 'attendance',
    icon: <img src={TicketsIcon} className="h-5 w-5" alt="Attendance" />,
    path: '/attendance',
  },
  {
    key: 'fees',
    icon: <img src={WalletIcon} className="h-5 w-5" alt="Fees" />,
    path: '/fees',
  },
  {
    key: 'busManagement',
    icon: <img src={BusIcon} className="h-5 w-5" alt="Bus Management" />,
    path: '/bus-management',
  },
  {
    key: 'notifications',
    icon: <img src={NotificationIcon} className="h-5 w-5" alt="Notifications" />,
    path: '/notifications',
  },
  {
    key: 'reports',
    icon: <img src={ReportsIcon} className="h-5 w-5" alt="Reports" />,
    path: '/reports',
  },
  {
    key: 'settings',
    icon: <img src={SettingsIcon} className="h-5 w-5" alt="Settings" />,
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
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Get menu items based on dashboard type or use custom items
  const menuItems = customMenuItems || getMenuItemsForDashboard(dashboardType);

  // Auto-expand parent menu item when visiting a sub-item URL
  useEffect(() => {
    const currentPath = location.pathname;

    // Find if current path matches any sub-item or starts with a sub-item path
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isSubItemActive = item.subItems.some(
          (subItem) => currentPath === subItem.path || currentPath.startsWith(subItem.path + '/')
        );

        if (isSubItemActive) {
          setExpandedItems((prev) => {
            if (!prev.includes(item.key)) {
              return [item.key];
            }
            return prev;
          });
        }
      }
    });
  }, [location.pathname, menuItems]);

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
          style={isExpanded ? { borderRadius: '20px 0 0 20px' } : undefined}
        >
          <button
            onClick={() => toggleExpand(item.key, firstSubItemPath)}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200 ${
              isAnySubItemActive
                ? 'bg-green-700 font-semibold text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ borderRadius: '20px 0 0 20px' }}
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
                <img
                  src={ChevronUp}
                  className="h-5 w-5"
                  alt="Collapse"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(1)',
                  }}
                />
              ) : (
                <img
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
        style={{ borderRadius: '20px 0 0 20px' }}
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
      <div className="border-gray-200 p-6">
        <h1 className="text-center text-2xl font-bold text-gray-800">Logo</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto pl-4">
        {menuItems.map(renderMenuItem)}
      </nav>
    </aside>
  );
};

export default Sidebar;
