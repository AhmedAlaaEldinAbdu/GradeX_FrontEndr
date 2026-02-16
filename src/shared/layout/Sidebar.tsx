import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { UserRole, type UserRoleType } from '@gradex/constants';
import CustomImage from '@/shared/components/CustomImage';

// Import icons
import HomeIcon from '@gradex/assets/icons/Home.svg';
import BookIcon from '@gradex/assets/icons/Book.svg';
import BusIcon from '@gradex/assets/icons/Bus.svg';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
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
import ContactFillGreenIcon from '@gradex/assets/icons/ContactFillGreen.svg';
import SchoolRegularIcon from '@gradex/assets/icons/SchoolRegular.svg';
import MainLogo from '@gradex/assets/identity/MainLogo.png';
import TeachersIcon from '@gradex/assets/icons/Teachers.svg';
import OrdersGreenIcon from '@gradex/assets/icons/OrdersGreen.svg';
import BookGreenIcon from '@gradex/assets/icons/BookGreen.svg';
import WorkGreenIcon from '@gradex/assets/icons/WorkGreen.svg';
import DateGreenIcon from '@gradex/assets/icons/DateGreen.svg';
import FilesGreenIcon from '@gradex/assets/icons/FilesGreen.svg';
import NoteEditGreenIcon from '@gradex/assets/icons/NoteEditGreen.svg';
import TaskDailyGreenIcon from '@gradex/assets/icons/TaskDailyGreen.svg';

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
    icon: <CustomImage src={HomeIcon} className="h-6 w-6" alt="Home" />,

    path: '/dashboard',
  },
  {
    key: 'academicSystem',
    icon: <CustomImage src={EducationIcon} className="h-6 w-6" alt="Academic System" />,

    path: '/academic-system',
  },
  {
    key: 'schools',
    icon: <CustomImage src={SchoolRegularIcon} className="h-6 w-6" alt="Schools" />,

    path: '/schools',
  },
  {
    key: 'officialHolidays',
    icon: <CustomImage src={BookIcon} className="h-6 w-6" alt="Official Holidays" />,

    path: '/official-holidays',
  },
  {
    key: 'marketing',
    icon: <CustomImage src={PeopleRegularIcon} className="h-6 w-6" alt="Marketing" />,

    path: '/marketing',
  },
  {
    key: 'employeesAdministration',
    icon: <CustomImage src={ContactIcon} className="h-6 w-6" alt="Employees & Administration" />,

    subItems: [
      {
        key: 'rolesPermissions',
        path: '/employees-administration/roles-permissions',
        icon: (
          <CustomImage src={ContactFillGreenIcon} className="h-6 w-6" alt="Roles & Permissions" />
        ),
      },
      {
        key: 'systemUsers',
        path: '/employees-administration/system-users',
        icon: <CustomImage src={ContactFillGreenIcon} className="h-6 w-6" alt="System Users" />,
      },
    ],
  },
  {
    key: 'reports',
    icon: <CustomImage src={ReportsIcon} className="h-6 w-6" alt="Reports" />,

    path: '/reports',
  },
  {
    key: 'tickets',
    icon: <CustomImage src={TicketsIcon} className="h-6 w-6" alt="Tickets" />,

    path: '/tickets',
  },
  {
    key: 'notifications',
    icon: <CustomImage src={NotificationIcon} className="h-6 w-6" alt="Notifications" />,

    path: '/notifications',
  },
  {
    key: 'messages',
    icon: <CustomImage src={SettingsIcon} className="h-6 w-6" alt="Messages" />,

    path: '/messages',
  },
  {
    key: 'settings',
    icon: <CustomImage src={SettingsIcon} className="h-6 w-6" alt="Settings" />,

    path: '/settings',
  },
];

/**
 * Get menu items for School Admin Dashboard
 */
const getSchoolAdminMenuItems = (): MenuItem[] => [
  {
    key: 'home',
    icon: <CustomImage src={HomeIcon} className="h-6 w-6" alt="Home" />,
    path: '/dashboard',
  },
  {
    key: 'educationalStages',
    icon: <CustomImage src={EducationIcon} className="h-6 w-6" alt="Education" />,
    subItems: [
      {
        icon: <CustomImage src={TeachersIcon} className="h-6 w-6" alt="Teachers" />,
        key: 'classrooms',
        path: '/classrooms',
      },
      {
        icon: <CustomImage src={OrdersGreenIcon} className="h-6 w-6" alt="Orders" />,
        key: 'subjects',
        path: '/subjects',
      },
      {
        key: 'books',
        icon: <CustomImage src={BookGreenIcon} className="h-6 w-6" alt="Books" />,
        path: '/books',
      },
    ],
  },
  {
    key: 'teachingStaff',
    icon: <CustomImage src={PeopleRegularIcon} className="h-6 w-6" alt="Teaching Staff" />,
    subItems: [
      {
        icon: <CustomImage src={TeachersIcon} className="h-6 w-6" alt="Teaching Staff" />,
        key: 'staff',
        path: '/teaching-staff',
      },
      {
        icon: <CustomImage src={WorkGreenIcon} className="h-6 w-6" alt="Work" />,
        key: 'jobAnnouncements',
        path: '/job-announcements',
      },
      {
        icon: <CustomImage src={DateGreenIcon} className="h-6 w-6" alt="Date" />,
        key: 'interviews',
        path: '/interviews',
      },
    ],
  },
  {
    key: 'calendarManagement',
    icon: <CustomImage src={CalendarIcon} className="h-6 w-6" alt="Calendar" />,
    subItems: [
      {
        icon: <CustomImage src={TeachersIcon} className="h-6 w-6" alt="Teachers" />,
        key: 'tasks',
        path: '/calendar/tasks',
      },
      {
        icon: <CustomImage src={FilesGreenIcon} className="h-6 w-6" alt="Files" />,
        key: 'preparations',
        path: '/calendar/preparations',
      },
      {
        icon: <CustomImage src={DateGreenIcon} className="h-6 w-6" alt="Date" />,
        key: 'weeklyCalendar',
        path: '/calendar/weekly',
      },
      {
        icon: <CustomImage src={NoteEditGreenIcon} className="h-6 w-6" alt="Note" />,
        key: 'monthlyCalendar',
        path: '/calendar/monthly',
      },
      {
        icon: <CustomImage src={TaskDailyGreenIcon} className="h-6 w-6" alt="Task" />,
        key: 'academicCalendar',
        path: '/calendar/academic',
      },
    ],
  },
  {
    key: 'studentManagement',
    icon: <CustomImage src={StudentsIcon} className="h-6 w-6" alt="Students" />,
    subItems: [
      {
        key: 'students',
        path: '/students',
        icon: <CustomImage src={PeopleSolidIcon} className="h-6 w-6" alt="Students List" />,
      },
      {
        key: 'studentApplications',
        path: '/student-applications',
        icon: <CustomImage src={ReportIcon} className="h-6 w-6" alt="Requests" />,
      },
      {
        key: 'interviews',
        path: '/student-interviews',
        icon: <CustomImage src={DateGreenIcon} className="h-6 w-6" alt="Interviews" />,
      },
      {
        key: 'registrationAnnouncement',
        path: '/registration-announcement',
        icon: (
          <CustomImage
            src={NoteEditGreenIcon}
            className="h-6 w-6"
            alt="Registration Announcement"
          />
        ),
      },
      {
        key: 'examResults',
        path: '/exam-results',
        icon: <CustomImage src={TaskDailyGreenIcon} className="h-6 w-6" alt="Exam Results" />,
      },
    ],
  },
  {
    key: 'attendance',
    icon: <CustomImage src={TicketsIcon} className="h-6 w-6" alt="Attendance" />,
    path: '/attendance',
  },
  {
    key: 'fees',
    icon: <CustomImage src={WalletIcon} className="h-6 w-6" alt="Fees" />,
    path: '/fees',
  },
  {
    key: 'busManagement',
    icon: <CustomImage src={BusIcon} className="h-6 w-6" alt="Bus Management" />,
    path: '/bus-management',
  },
  {
    key: 'notifications',
    icon: <CustomImage src={NotificationIcon} className="h-6 w-6" alt="Notifications" />,
    path: '/notifications',
  },
  {
    key: 'reports',
    icon: <CustomImage src={ReportsIcon} className="h-6 w-6" alt="Reports" />,
    path: '/reports',
  },
  {
    key: 'settings',
    icon: <CustomImage src={SettingsIcon} className="h-6 w-6" alt="Settings" />,
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
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isEnglish = i18n.language?.toLowerCase().startsWith('en');
  const menuTextSizeClass = isEnglish ? 'text-sm' : 'text-xl';

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
          className={`mb-2 ${isExpanded ? 'rounded-lg bg-green-50' : ''}`}
          style={
            isExpanded ? { borderRadius: isRTL ? '32px 0 0 32px' : '0 32px 32px 0' } : undefined
          }
        >
          <button
            onClick={() => toggleExpand(item.key, firstSubItemPath)}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200 ${
              isAnySubItemActive
                ? 'linear-green font-medium text-white'
                : 'text-black-700 hover:bg-gray-100'
            }`}
            style={{ borderRadius: isRTL ? '32px 0 0 32px' : '0 32px 32px 0' }}
          >
            <div className="flex items-center gap-3">
              <span
                className={isAnySubItemActive ? 'text-white' : 'text-black-700'}
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
              <span className={`${menuTextSizeClass} font-medium`}>{t(`sidebar.${item.key}`)}</span>
            </div>
            <span className={isAnySubItemActive ? 'text-white' : 'text-black-700'}>
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
            <div className="space-y-0 rounded-b-[32px] border">
              {item.subItems?.map((subItem, subIndex) => {
                // Check if sub-item is active (exact match or nested route)
                const isSubItemActive =
                  location.pathname === subItem.path ||
                  location.pathname.startsWith(subItem.path + '/');

                const isLastSubItem =
                  subIndex === (item.subItems ? Math.max(0, item.subItems.length - 1) : 0);

                return (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 ${menuTextSizeClass} transition-colors duration-200 ${
                        isActive || isSubItemActive
                          ? `bg-green-100 font-medium text-green-800 ${isLastSubItem ? 'rounded-b-[32px]' : ''}`
                          : 'hover:bg-green-75 text-green-700'
                      }`
                    }
                  >
                    {subItem.icon && (
                      <span className={isSubItemActive ? 'text-green-800' : 'text-green-700'}>
                        {subItem.icon}
                      </span>
                    )}
                    <span className="text-green-500">{t(`sidebar.${subItem.key}`)}</span>
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
          `mb-2 flex items-center gap-3 rounded-lg px-4 py-3 ${menuTextSizeClass} transition-colors duration-200 ${
            isActive
              ? 'linear-green font-medium text-white'
              : 'text-black-700 hover:bg-green-100 hover:text-green-500'
          }`
        }
        style={{ borderRadius: isRTL ? '32px 0 0 32px' : '0 32px 32px 0' }}
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
            <span className="font-medium">{t(`sidebar.${item.key}`)}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white shadow-lg">
      {/* Sidebar Header */}
      <div className="h-[96px] border-gray-200 px-6 py-4">
        {/* <h1 className="text-center text-xl font-bold text-gray-800">Logo</h1> */}
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
