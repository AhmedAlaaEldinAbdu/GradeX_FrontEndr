import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useSchoolBranchName } from '@/hooks/useSchoolBranchName';
import { UserRole, type UserRoleType } from '@gradex/constants';
import CustomImage from '@/shared/components/CustomImage';

// Icons
import HomeIcon from '@gradex/assets/icons/Home.svg';
import BookIcon from '@gradex/assets/icons/Book.svg';
import BusIcon from '@gradex/assets/icons/Bus.svg';
import EducationIcon from '@gradex/assets/icons/Education.svg';
import NotificationIcon from '@gradex/assets/icons/Notification.svg';
import PeopleRegularIcon from '@gradex/assets/icons/PeopleRegular.svg';
import TicketsIcon from '@gradex/assets/icons/Tickets.svg';
import ReportsIcon from '@gradex/assets/icons/Reports.svg';
import SettingsIcon from '@gradex/assets/icons/Settings.svg';
import ContactIcon from '@gradex/assets/icons/Contact.svg';
import SchoolRegularIcon from '@gradex/assets/icons/SchoolRegular.svg';
import MainLogo from '@/assets/identity/MainLogo.svg';
import ClasstiLogo from '@/assets/identity/classtiLogo.svg';
import DataSourcesIcon from '@gradex/assets/icons/DataSources.svg';
import DatePickerIcon from '@gradex/assets/icons/DatePicker.svg';
import DocumentEditIcon from '@gradex/assets/icons/DocumentEdit.svg';
import LedgerIcon from '@gradex/assets/icons/Ledger.svg';
import MembersIcon from '@gradex/assets/icons/Members.svg';
import NotesIcon from '@gradex/assets/icons/Notes.svg';
import OpenBookIcon from '@gradex/assets/icons/OpenBook.svg';
import PCIcon from '@gradex/assets/icons/PC.svg';
import ReportApprovedIcon from '@gradex/assets/icons/ReportApproved.svg';
import UserIcon from '@gradex/assets/icons/User.svg';
import ImageIcon from '@gradex/assets/icons/Image.svg';
import AnalyticsIcon from '@gradex/assets/icons/Analytics.svg';
import SideArrow from '@/assets/icons/SideArrow.svg';
import SidebarTopVector1 from '@/assets/sidebar-pattern/top-vector-1.svg';
import SidebarTopVector2 from '@/assets/sidebar-pattern/top-vector-2.svg';
import SidebarTopVector3 from '@/assets/sidebar-pattern/top-vector-3.svg';
import SidebarTopVector4 from '@/assets/sidebar-pattern/top-vector-4.svg';
import SidebarTopVector5 from '@/assets/sidebar-pattern/top-vector-5.svg';
import SidebarEllipseGlow from '@/assets/sidebar-pattern/ellipse-glow.svg';

const ICON_FILTER_WHITE: React.CSSProperties = {
  filter: 'brightness(0) saturate(100%) invert(1)',
};
// Approximates #8FA89A (var(--ink-mute)) for inactive icons.
const ICON_FILTER_MUTE: React.CSSProperties = {
  filter:
    'brightness(0) saturate(100%) invert(67%) sepia(11%) saturate(414%) hue-rotate(94deg) brightness(94%) contrast(89%)',
  opacity: 0.8,
};
const MUTED_OPACITY: React.CSSProperties = { opacity: 0.8 };

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const SIDEBAR_FONT = "font-['IBM_Plex_Sans_Arabic',sans-serif]";
const MUTED_TEXT = 'text-[#8FA89A] opacity-80';
const SIDEBAR_COLLAPSE_STORAGE_KEY = 'gradex.sidebar.collapsed';
const ACTIVE_ROW_BG_RTL =
  'bg-[linear-gradient(90deg,rgba(35,114,71,0.53)_0%,rgba(18,52,34,0.85)_92.788%)]';
const ACTIVE_ROW_BG_LTR =
  'bg-[linear-gradient(270deg,rgba(35,114,71,0.53)_0%,rgba(18,52,34,0.85)_92.788%)]';
const SIDEBAR_TOP_PATTERN_LAYERS = [
  {
    src: SidebarTopVector1,
    className: 'absolute inset-[-1.1%_-0.08%_31.9%_14.18%] mix-blend-color-dodge',
  },
  {
    src: SidebarTopVector2,
    className: 'absolute inset-[-1.1%_6.02%_45.21%_0] mix-blend-color-dodge',
  },
  {
    src: SidebarTopVector3,
    className: 'absolute inset-[-1.91%_-0.45%_51.28%_22.73%] mix-blend-screen',
  },
  {
    src: SidebarTopVector4,
    className: 'absolute inset-[-1.1%_-0.08%_46.15%_65.27%] mix-blend-color-dodge',
  },
  {
    src: SidebarTopVector5,
    className: 'absolute inset-[-1.1%_-0.08%_0_10.72%] mix-blend-color-dodge',
  },
] as const;

interface SidebarProps {
  dashboardType: UserRoleType;
  customMenuItems?: MenuItem[];
}

interface MenuSubItem {
  key: string;
  path: string;
}

type MenuBadge = { type: 'count'; value: string | number } | { type: 'tag'; value: string };

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  path?: string;
  badge?: MenuBadge;
  subItems?: MenuSubItem[];
}

interface MenuSection {
  titleKey?: string;
  items: MenuItem[];
}

const renderIcon = (src: string, alt: string) => (
  <CustomImage src={src} className="h-4 w-4" alt={alt} />
);

const SidebarPatternLayer: React.FC<{ src: string; className: string }> = ({ src, className }) => (
  <div className={className}>
    <img alt="" src={src} className="absolute inset-0 block h-full w-full max-w-none" />
  </div>
);

const SidebarPatternBackground: React.FC<{ isRTL: boolean }> = ({ isRTL }) => (
  <>
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-[-10px] z-0 h-[157px] w-[222px] overflow-hidden opacity-30',
        isRTL ? 'right-[-42px]' : 'left-[-42px] scale-x-[-1]'
      )}
    >
      {SIDEBAR_TOP_PATTERN_LAYERS.map((layer) => (
        <SidebarPatternLayer key={layer.src} src={layer.src} className={layer.className} />
      ))}
    </div>

    <img
      alt=""
      src={SidebarEllipseGlow}
      className={cn(
        'pointer-events-none absolute top-[-199px] z-[1] h-[400px] w-[401px] max-w-none',
        isRTL ? 'left-[-164px]' : 'right-[-164px]'
      )}
    />
  </>
);

/**
 * Super Admin sections
 */
const getSuperAdminSections = (): MenuSection[] => [
  {
    items: [
      { key: 'home', icon: renderIcon(HomeIcon, 'Home'), path: '/dashboard' },
      {
        key: 'academicSystem',
        icon: renderIcon(EducationIcon, 'Academic System'),
        path: '/academic-system',
      },
      { key: 'schools', icon: renderIcon(SchoolRegularIcon, 'Schools'), path: '/schools' },
      {
        key: 'officialHolidays',
        icon: renderIcon(BookIcon, 'Official Holidays'),
        path: '/official-holidays',
      },
      {
        key: 'marketing',
        icon: renderIcon(PeopleRegularIcon, 'Marketing'),
        path: '/marketing',
      },
      {
        key: 'employeesAdministration',
        icon: renderIcon(ContactIcon, 'Employees & Administration'),
        subItems: [
          { key: 'rolesPermissions', path: '/employees-administration/roles-permissions' },
          { key: 'systemUsers', path: '/employees-administration/system-users' },
        ],
      },
      { key: 'reports', icon: renderIcon(ReportsIcon, 'Reports'), path: '/reports' },
      { key: 'tickets', icon: renderIcon(TicketsIcon, 'Tickets'), path: '/tickets' },
      {
        key: 'notifications',
        icon: renderIcon(NotificationIcon, 'Notifications'),
        path: '/notifications',
      },
      { key: 'messages', icon: renderIcon(SettingsIcon, 'Messages'), path: '/messages' },
      { key: 'settings', icon: renderIcon(SettingsIcon, 'Settings'), path: '/settings' },
    ],
  },
];

/**
 * School Admin sections — grouped per design
 */
const getSchoolAdminSections = (): MenuSection[] => [
  {
    items: [{ key: 'home', icon: renderIcon(HomeIcon, 'Dashboard'), path: '/dashboard' }],
  },
  {
    titleKey: 'academicAffairs',
    items: [
      {
        key: 'eduStages',
        icon: renderIcon(OpenBookIcon, 'Educational Stages'),
        subItems: [
          { key: 'stagesClassrooms', path: '/classrooms' },
          { key: 'subjects', path: '/subjects' },
          { key: 'books', path: '/books' },
        ],
      },
      {
        key: 'lms',
        icon: renderIcon(PCIcon, 'E-Learning'),
        badge: { type: 'tag', value: 'LMS' },
        subItems: [
          { key: 'overview', path: '/lms/overview' },
          { key: 'liveClasses', path: '/lms/live-classes' },
          { key: 'onlineExams', path: '/lms/online-exams' },
          { key: 'trainingCourses', path: '/lms/courses' },
          { key: 'questionBank', path: '/lms/question-bank' },
          { key: 'assignments', path: '/calendar/tasks' },
          { key: 'lessonPreparation', path: '/calendar/preparations' },
        ],
      },
      {
        key: 'calendarManagement',
        icon: renderIcon(DatePickerIcon, 'Academic Calendar'),
        subItems: [
          { key: 'weeklyCalendar', path: '/calendar/weekly' },
          { key: 'monthlyCalendar', path: '/calendar/monthly' },
          { key: 'annualCalendar', path: '/calendar/academic' },
        ],
      },
      {
        key: 'examResults',
        icon: renderIcon(NotesIcon, 'Exam Results'),
        path: '/exam-results',
      },
    ],
  },
  {
    titleKey: 'studentAffairs',
    items: [
      {
        key: 'studentManagement',
        icon: renderIcon(MembersIcon, 'Student Management'),
        subItems: [
          { key: 'students', path: '/students-record' },
          { key: 'studentAttendance', path: '/students/attendance' },
          { key: 'studentApplications', path: '/student-applications' },
          { key: 'registrationAnnouncement', path: '/registration-announcement' },
          { key: 'interviews', path: '/student-interviews' },
        ],
      },
      {
        key: 'requests',
        icon: renderIcon(ReportApprovedIcon, 'Requests'),
        path: '/requests',
        badge: { type: 'count', value: 1 },
      },
      {
        key: 'busManagement',
        icon: renderIcon(BusIcon, 'School Transport'),
        subItems: [
          { key: 'buses', path: '/bus-management/bus' },
          { key: 'drivers', path: '/bus-management/drivers' },
        ],
      },
    ],
  },
  {
    titleKey: 'humanResources',
    items: [
      {
        key: 'teachingStaff',
        icon: renderIcon(UserIcon, 'Staff'),
        subItems: [
          { key: 'staff', path: '/teaching-staff' },
          { key: 'jobAnnouncements', path: '/job-announcements' },
          { key: 'interviews', path: '/interviews' },
        ],
      },
      {
        key: 'attendance',
        icon: renderIcon(DocumentEditIcon, 'Attendance'),
        path: '/employees/attendance',
      },
      {
        key: 'adminRequests',
        icon: renderIcon(LedgerIcon, 'Admin Requests'),
        path: '/admin-requests',
        badge: { type: 'count', value: 1 },
      },
    ],
  },
  {
    titleKey: 'financialAffairs',
    items: [
      {
        key: 'financialManagement',
        icon: renderIcon(DataSourcesIcon, 'Financial Management'),
        subItems: [
          { key: 'financialTransactions', path: '/financial-management/transactions' },
          { key: 'tuitionFees', path: '/financial-management/fees' },
          { key: 'invoices', path: '/financial-management/invoices' },
          { key: 'customers', path: '/financial-management/customers' },
          { key: 'contracts', path: '/financial-management/contracts' },
        ],
      },
    ],
  },
  {
    titleKey: 'tools',
    items: [
      {
        key: 'studio',
        icon: renderIcon(ImageIcon, 'Studio'),
        path: '/studio',
      },
      {
        key: 'reports',
        icon: renderIcon(AnalyticsIcon, 'Reports'),
        path: '/reports',
      },
    ],
  },
  {
    titleKey: 'systemSettings',
    items: [
      {
        key: 'settings',
        icon: renderIcon(SettingsIcon, 'Settings'),
        subItems: [
          { key: 'schoolData', path: '/settings/school-data' },
          { key: 'jobRoles', path: '/settings/job-roles' },
          { key: 'paymentChannels', path: '/settings/payment-channels' },
          { key: 'holidaysSettings', path: '/settings/holidays' },
          { key: 'siteSettings', path: '/settings/site' },
          { key: 'notifications', path: '/settings/notifications' },
        ],
      },
    ],
  },
];

const getSectionsForDashboard = (dashboardType: UserRoleType): MenuSection[] => {
  switch (dashboardType) {
    case UserRole.SUPER_ADMIN:
      return getSuperAdminSections();
    case UserRole.SCHOOL_ADMIN:
      return getSchoolAdminSections();
    default:
      return getSchoolAdminSections();
  }
};

/* Chevron — uses the SideArrow.svg asset, rotated to match direction
   and expand/collapse state. SideArrow's native shape points LEFT (<),
   so rotations are computed relative to that:
     RTL collapsed → 0deg   (<)
     RTL expanded  → -90deg (v)
     LTR collapsed → 180deg (>)
     LTR expanded  →  90deg (v)
   When the row is active the icon is filtered white; otherwise it keeps
   the asset's native muted #8FA89A so it matches inactive icons. */
const Chevron: React.FC<{ expanded: boolean; isRTL: boolean; active: boolean }> = ({
  expanded,
  isRTL,
  active,
}) => {
  const rotationClass = isRTL
    ? expanded
      ? '-rotate-90'
      : 'rotate-0'
    : expanded
      ? 'rotate-90'
      : 'rotate-180';

  return (
    <img
      src={SideArrow}
      alt=""
      aria-hidden
      className={cn(
        'h-[9px] w-[5px] shrink-0 object-contain transition-transform duration-200',
        rotationClass
      )}
      style={active ? ICON_FILTER_WHITE : MUTED_OPACITY}
    />
  );
};

const BadgeView: React.FC<{ badge: MenuBadge }> = ({ badge }) => {
  if (badge.type === 'tag') {
    // Figma LMS chip: padding 2px 8px, bg #00BC7D, radius 4,
    return (
      <span className="inline-flex h-[19px] w-[34.362px] flex-shrink-0 items-center justify-center rounded-[4px] bg-[#00bc7d] px-[8px] py-[2px] text-[10px] font-bold leading-[15px] text-white">
        {badge.value}
      </span>
    );
  }
  // Count badge — Figma: 16×16 white circle, dark green text 12 / 700.
  return (
    <span className="inline-flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full bg-white text-center text-[12px] font-bold leading-none text-[#00512e]">
      {badge.value}
    </span>
  );
};

const BrandMark: React.FC = () => (
  // <div className="relative h-[40px] w-[40px] flex-shrink-0 overflow-hidden rounded-[12px] shadow-[0_1px_12px_1px_rgba(255,245,245,0.06)]">
  <CustomImage
    src={MainLogo}
    alt="Classti"
    // className="absolute left-[-13px] top-[-12px] h-[66px] w-[61px] max-w-none"
  />
  // </div>
);

interface CollapsedGroupItemProps {
  item: MenuItem;
  iconCell: React.ReactNode;
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  isRTL: boolean;
  textAlignClass: string;
  currentPath: string;
  t: (k: string) => string;
}

const CollapsedGroupItem: React.FC<CollapsedGroupItemProps> = ({
  item,
  iconCell,
  isActive,
  isOpen,
  onOpen,
  onClose,
  onToggle,
  isRTL,
  textAlignClass,
  currentPath,
  t,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [coords, setCoords] = useState<{ top: number; left?: number; right?: number } | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const handleEnter = () => {
    cancelClose();
    onOpen();
  };
  const handleLeave = () => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      onClose();
      closeTimerRef.current = null;
    }, 180);
  };
  // Make sure no stray timer survives unmount.
  useEffect(() => () => cancelClose(), []);

  // Compute fixed-position coords each time the flyout opens.
  useEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }
    const compute = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (isRTL) {
        setCoords({ top: rect.top, right: window.innerWidth - rect.left + 8 });
      } else {
        setCoords({ top: rect.top, left: rect.right + 8 });
      }
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [isOpen, isRTL]);

  // Click outside closes.
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!wrapperRef.current?.contains(target) && !flyoutRef.current?.contains(target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen, onClose]);

  return (
    <div ref={wrapperRef} className="w-full" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        title={t(`sidebar.${item.key}`)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => {
          cancelClose();
          onToggle();
        }}
        className={`flex w-full items-center justify-center py-3 transition-colors ${
          isActive || isOpen ? '' : 'hover:bg-white/[0.03]'
        }`}
      >
        {iconCell}
      </button>

      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={flyoutRef}
            role="menu"
            dir={isRTL ? 'rtl' : 'ltr'}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className="fixed z-[1000] min-w-[220px] rounded-[12px] bg-[#0f1f17] p-[8px] shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]"
            style={{
              top: coords.top,
              left: coords.left,
              right: coords.right,
            }}
          >
            <div
              className={`mb-1 border-b border-white/10 px-3 pb-2 pt-1 text-[12px] font-semibold text-white ${textAlignClass}`}
            >
              {t(`sidebar.${item.key}`)}
            </div>
            <div className="mt-[4px] flex flex-col gap-[4px]">
              {item.subItems!.map((sub) => {
                const isSubActive =
                  currentPath === sub.path || currentPath.startsWith(sub.path + '/');
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    onClick={onClose}
                    className={cn(
                      'box-border flex min-h-[28px] items-center gap-[8px] rounded-[8px] px-[16px] py-[1px] text-[11px] font-medium transition-colors',
                      'flex-row',
                      isSubActive
                        ? 'bg-[rgba(0,224,127,0.08)] text-white'
                        : 'text-[#8FA89A] hover:bg-white/[0.04]'
                    )}
                  >
                    <span
                      className={cn(
                        'h-[5px] w-[5px] flex-shrink-0 rounded-full',
                        isSubActive ? 'bg-white' : 'bg-[#8FA89A] opacity-80'
                      )}
                    />
                    <span
                      className={cn(
                        'flex-1 truncate',
                        textAlignClass,
                        !isSubActive && 'opacity-80'
                      )}
                    >
                      {t(`sidebar.${sub.key}`)}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

/**
 * Sidebar Component
 */
const Sidebar: React.FC<SidebarProps> = ({ dashboardType, customMenuItems }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  // Shared cached fetch — Header consumes the same hook so the network call is deduped.
  // The locals are kept named so the (currently commented) JSX block that displays them
  // stays compatible if it's restored.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name: _schoolName, isLoading: _isLoadingSchoolName } = useSchoolBranchName();
  const [hasUserOverride, setHasUserOverride] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY) !== null;
  });
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
    return window.matchMedia('(max-width: 1023px)').matches;
  });
  // Which parent's flyout panel is currently open (collapsed mode only).
  const [flyoutKey, setFlyoutKey] = useState<string | null>(null);

  const handleToggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* localStorage unavailable — silently ignore */
      }
      return next;
    });
    setHasUserOverride(true);
  };

  const navRef = useRef<HTMLElement | null>(null);
  const [scroll, setScroll] = useState<{
    visible: boolean;
    thumbTop: number;
    thumbHeight: number;
  }>({ visible: false, thumbTop: 0, thumbHeight: 0 });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const recompute = () => {
      const { scrollTop, scrollHeight, clientHeight } = nav;
      const overflow = scrollHeight - clientHeight;
      if (overflow <= 1) {
        setScroll({ visible: false, thumbTop: 0, thumbHeight: 0 });
        return;
      }
      const trackInset = 14;
      const trackHeight = Math.max(0, clientHeight - trackInset * 2);
      const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * trackHeight);
      const thumbTop = trackInset + (scrollTop / overflow) * (trackHeight - thumbHeight);
      setScroll({ visible: true, thumbTop, thumbHeight });
    };

    recompute();
    nav.addEventListener('scroll', recompute, { passive: true });
    const ro = new ResizeObserver(recompute);
    ro.observe(nav);
    // Also observe content size changes
    if (nav.firstElementChild) ro.observe(nav.firstElementChild as Element);
    return () => {
      nav.removeEventListener('scroll', recompute);
      ro.disconnect();
    };
  }, [isCollapsed]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      if (hasUserOverride) return;
      setIsCollapsed(e.matches);
    };
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [hasUserOverride]);

  // Close any open flyout when route changes or when the sidebar uncollapses.
  useEffect(() => {
    setFlyoutKey(null);
  }, [location.pathname, isCollapsed]);

  const sections: MenuSection[] = customMenuItems
    ? [{ items: customMenuItems }]
    : getSectionsForDashboard(dashboardType);

  const flatItems = sections.flatMap((s) => s.items);
  const firstTitledIdx = sections.findIndex((s) => !!s.titleKey);

  // Auto-expand parent of active sub-item
  useEffect(() => {
    const currentPath = location.pathname;
    let toExpand: string | null = null;

    flatItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isSubActive = item.subItems.some(
          (s) => currentPath === s.path || currentPath.startsWith(s.path + '/')
        );
        if (isSubActive) toExpand = item.key;
      }
    });

    setExpandedItems((prev) => {
      if (toExpand) return prev.includes(toExpand) ? prev : [toExpand];
      return [];
    });
    // eslint-disable-next-line
  }, [location.pathname]);

  const toggleExpand = (key: string, firstSubItemPath?: string) => {
    const isExpanded = expandedItems.includes(key);
    if (isExpanded) {
      setExpandedItems((prev) => prev.filter((k) => k !== key));
    } else {
      setExpandedItems([key]);
      if (firstSubItemPath) navigate(firstSubItemPath);
    }
  };

  const textAlignClass = isRTL ? 'text-right' : 'text-left';
  const rowDirectionClass = 'flex-row';
  const activeBorderClass = isRTL ? 'border-r' : 'border-l';
  const activeBgClass = isRTL ? ACTIVE_ROW_BG_RTL : ACTIVE_ROW_BG_LTR;
  const menuItemsAlignClass = isRTL ? 'items-start' : 'items-end';
  const getMainItemClass = (active: boolean) =>
    cn(
      'relative box-border flex h-[32px] w-[199px] shrink-0 items-center justify-between rounded-[8px] border-0 px-[12px] py-[4px] text-start text-[12px] font-medium outline-none transition-colors',
      rowDirectionClass,
      active
        ? `${activeBorderClass} border-solid border-white ${activeBgClass} text-white`
        : 'bg-transparent text-[#8FA89A] hover:bg-white/[0.03]'
    );

  const renderRow = (
    item: MenuItem,
    opts: { active: boolean; hasSubItems: boolean; expanded: boolean }
  ) => {
    const { active, hasSubItems, expanded } = opts;
    const hasTrailingGroup = !!item.badge || hasSubItems;
    return (
      <div
        className={cn(
          'flex w-full select-none items-center justify-between gap-[16px] text-[12px] font-medium',
          rowDirectionClass
        )}
      >
        <div className={cn('flex min-w-0 items-center gap-[8px]', rowDirectionClass)}>
          <span
            className="grid h-4 w-4 flex-shrink-0 place-items-center"
            style={active ? ICON_FILTER_WHITE : ICON_FILTER_MUTE}
          >
            {item.icon}
          </span>
          <span className={cn('truncate', textAlignClass, active ? 'text-white' : MUTED_TEXT)}>
            {t(`sidebar.${item.key}`)}
          </span>
        </div>

        {hasTrailingGroup && (
          <div className="flex flex-shrink-0 items-center gap-[1px]">
            {item.badge && <BadgeView badge={item.badge} />}
            {hasSubItems && (
              <span className="grid h-[14px] w-[14px] place-items-center">
                <Chevron expanded={expanded} isRTL={isRTL} active={active} />
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCollapsedItem = (item: MenuItem) => {
    const hasSubItems = !!(item.subItems && item.subItems.length > 0);
    const isActive = hasSubItems
      ? item.subItems!.some(
          (s) => location.pathname === s.path || location.pathname.startsWith(s.path + '/')
        )
      : !!item.path &&
        (location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

    const iconCell = (
      <span
        className="grid h-6 w-6 place-items-center"
        style={isActive ? ICON_FILTER_WHITE : ICON_FILTER_MUTE}
      >
        {item.icon}
      </span>
    );

    if (!hasSubItems) {
      return (
        <NavLink
          key={item.key}
          to={item.path!}
          title={t(`sidebar.${item.key}`)}
          className={`flex w-full items-center justify-center py-3 transition-colors ${
            isActive ? '' : 'hover:bg-white/[0.03]'
          }`}
        >
          {iconCell}
        </NavLink>
      );
    }

    // Parent with sub-items: hover/tap toggles a flyout panel.
    return (
      <CollapsedGroupItem
        key={item.key}
        item={item}
        iconCell={iconCell}
        isActive={isActive}
        isOpen={flyoutKey === item.key}
        onOpen={() => setFlyoutKey(item.key)}
        onClose={() => setFlyoutKey((k) => (k === item.key ? null : k))}
        onToggle={() => setFlyoutKey(flyoutKey === item.key ? null : item.key)}
        isRTL={isRTL}
        textAlignClass={textAlignClass}
        currentPath={location.pathname}
        t={t}
      />
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    if (isCollapsed) return renderCollapsedItem(item);

    const isExpanded = expandedItems.includes(item.key);
    const hasSubItems = !!(item.subItems && item.subItems.length > 0);
    const isAnySubItemActive =
      hasSubItems &&
      item.subItems!.some(
        (s) => location.pathname === s.path || location.pathname.startsWith(s.path + '/')
      );

    if (hasSubItems) {
      const firstPath = item.subItems![0].path;
      const isActive = isAnySubItemActive;

      return (
        <div key={item.key}>
          <button
            type="button"
            onClick={() => toggleExpand(item.key, firstPath)}
            className={cn('cursor-pointer', getMainItemClass(isActive))}
          >
            {renderRow(item, { active: isActive, hasSubItems: true, expanded: isExpanded })}
          </button>

          {isExpanded && (
            <div className="mt-[4px] flex flex-col gap-[4px] overflow-hidden">
              {item.subItems!.map((sub) => {
                const isSubActive =
                  location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    className={cn(
                      'box-border flex h-[28px] w-[199px] cursor-pointer select-none items-center gap-[8px] rounded-[8px] px-[16px] py-[1px] text-[11px] font-medium transition-colors',
                      rowDirectionClass,
                      isSubActive
                        ? 'bg-[rgba(0,224,127,0.08)] text-white'
                        : 'text-[#8FA89A] hover:bg-white/[0.02]'
                    )}
                  >
                    <span
                      className={cn(
                        'h-[5px] w-[5px] flex-shrink-0 rounded-full',
                        isSubActive ? 'bg-white' : 'bg-[#8FA89A] opacity-80'
                      )}
                    />
                    <span
                      className={cn(
                        'flex-1 truncate',
                        textAlignClass,
                        !isSubActive && 'opacity-80'
                      )}
                    >
                      {t(`sidebar.${sub.key}`)}
                    </span>
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
        className={({ isActive }) => getMainItemClass(isActive)}
      >
        {({ isActive }) =>
          renderRow(item, { active: isActive, hasSubItems: false, expanded: false })
        }
      </NavLink>
    );
  };

  const sidebarWidthClass = isCollapsed ? 'w-[64px]' : 'w-[230px]';

  return (
    <>
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed inset-y-0 z-40 flex h-[100dvh] flex-col gap-[12px] overflow-hidden bg-[#0f1f17] py-[16px] text-white',
          'transition-[width] duration-300 ease-out',
          isRTL ? 'right-0' : 'left-0',
          SIDEBAR_FONT,
          sidebarWidthClass
        )}
        aria-label="Main navigation"
      >
        <SidebarPatternBackground isRTL={isRTL} />

        <div className="relative z-[4] flex h-[57px] w-full flex-shrink-0 flex-col items-end justify-center gap-[12px] px-[8px]">
          {isCollapsed ? (
            // Collapsed: center the Classti logo only.
            <div className="flex items-center justify-center self-center px-2">
              <CustomImage src={ClasstiLogo} alt="Classti" className="h-10 w-10 object-contain" />
            </div>
          ) : (
            <div
              className={cn(
                'flex h-[45px] w-[177px] shrink-0 items-center justify-center gap-[12px] self-center',
                rowDirectionClass
              )}
            >
              <BrandMark />
            </div>
          )}

          <div
            className={cn('h-0 border-t border-white/[0.15]', isCollapsed ? 'w-full' : 'w-[214px]')}
          />
        </div>

        {/* Scroll region wrapper for the custom nav-only scrollbar. */}
        <div className="relative z-[2] min-h-0 flex-1">
          <nav
            ref={navRef}
            className="sidebar-scroll absolute inset-0 overflow-y-auto overflow-x-hidden px-[8px]"
            aria-label="primary"
          >
            {sections.map((section, idx) => {
              const showRule = !!section.titleKey && idx > firstTitledIdx;
              // In collapsed mode, titled sections use only a divider.
              const showCollapsedRule = isCollapsed && !!section.titleKey && idx > 0;

              return (
                <div key={`section-${idx}`} className={idx > 0 ? 'mt-[12px]' : ''}>
                  {showCollapsedRule && (
                    <div className="mx-auto my-[8px] h-px w-[32px] bg-white/10" />
                  )}
                  {!isCollapsed && showRule && (
                    <div className={cn('flex w-full', menuItemsAlignClass)}>
                      <div className="h-px w-[199px] bg-white/10" />
                    </div>
                  )}
                  {!isCollapsed && section.titleKey && (
                    <div
                      className={cn(
                        'mb-[-2px] px-[8px] text-[10px] font-medium leading-[32px] text-[#8FA89A] opacity-80',
                        textAlignClass
                      )}
                    >
                      {t(`sidebar.${section.titleKey}`)}
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex flex-col gap-[8px]',
                      isCollapsed ? 'items-stretch' : menuItemsAlignClass
                    )}
                  >
                    {section.items.map(renderMenuItem)}
                  </div>
                </div>
              );
            })}
          </nav>

          {scroll.visible && (
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-y-0 z-[4] w-[3px]',
                isRTL ? 'left-[2px]' : 'right-[2px]'
              )}
            >
              <div className="absolute inset-y-[14px] left-0 w-[3px] rounded-[8px] bg-[rgba(0,81,46,0.4)]" />
              <div
                className="absolute left-0 w-[3px] rounded-[8px] bg-[#8FA89A] transition-colors"
                style={{
                  top: scroll.thumbTop,
                  height: scroll.thumbHeight,
                }}
              />
            </div>
          )}
        </div>
      </aside>

      <button
        type="button"
        onClick={handleToggleCollapsed}
        aria-label={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        aria-expanded={!isCollapsed}
        title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        className={cn(
          'group fixed top-[60px] z-50 grid h-[26px] w-[26px] place-items-center rounded-full',
          'border border-white/[0.08] bg-[#182f20] text-white',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          'transition-[left,right,background-color,border-color,box-shadow,transform] duration-300 ease-out',
          'hover:border-[rgba(0,224,127,0.45)] hover:bg-[#1b3a31]',
          'hover:shadow-[0_0_0_1px_rgba(0,188,125,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1f17]',
          'active:scale-[0.94]'
        )}
        style={{
          [isRTL ? 'right' : 'left']: isCollapsed ? '51px' : '217px',
        }}
      >
        {/* Soft emerald halo on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[-4px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,224,127,0.22),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <img
          src={SideArrow}
          alt=""
          aria-hidden
          className={cn(
            'relative h-[10px] w-[6px] object-contain transition-transform duration-300 ease-out',
            // SideArrow points LEFT natively. Arrow points in the direction the sidebar will move.
            isRTL
              ? isCollapsed
                ? 'rotate-0'
                : 'rotate-180'
              : isCollapsed
                ? 'rotate-180'
                : 'rotate-0'
          )}
          style={ICON_FILTER_WHITE}
        />
      </button>

      <div
        aria-hidden
        className={cn(
          'h-[100dvh] flex-shrink-0 transition-[width] duration-300 ease-out',
          sidebarWidthClass
        )}
      />
    </>
  );
};

export default Sidebar;
