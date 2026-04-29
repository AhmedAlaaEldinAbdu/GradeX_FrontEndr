import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { UserRole, type UserRoleType } from '@gradex/constants';
import CustomImage from '@/shared/components/CustomImage';
import { axiosClient } from '@/lib/http';
import { SchoolsEndpoints } from '@/services/api/endpoints/schools-endpoints';
import { getCurrentSchoolBranchId } from '@/lib/auth/token-manager';

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
import AlNukhbaLogo from '@/assets/identity/AlNukhbaLogo.svg';
import GradeXLogo from '@gradex/assets/identity/GradeX.svg';
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

/* === Design tokens (match standalone HTML) ============================ */
const C = {
  bg: '#0F1F17',
  ink: '#FFFFFF',
  inkDim: '#D6DDD8',
  inkMute: '#8FA89A',
  line: 'rgba(255,255,255,0.15)',
  rule: 'rgba(255,255,255,0.10)',
  lms: '#00BC7D',
  subActive: '#073924',
  countText: '#00512E',
  activeBorder: 'rgba(143, 168, 154, 0.35)',
  activeGradient: 'linear-gradient(180deg, #0A4A2E 0%, #073924 100%)',
  blobGradient:
    'radial-gradient(50% 50% at 50% 50%, rgba(134, 249, 142, 0.15) 0%, rgba(134, 249, 142, 0) 100%)',
} as const;

const ICON_FILTER_WHITE: React.CSSProperties = {
  filter: 'brightness(0) saturate(100%) invert(1)',
};
// Approximates #8FA89A (var(--ink-mute)) for inactive icons.
const ICON_FILTER_MUTE: React.CSSProperties = {
  filter:
    'brightness(0) saturate(100%) invert(67%) sepia(11%) saturate(414%) hue-rotate(94deg) brightness(94%) contrast(89%)',
};

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
  <CustomImage src={src} className="h-[17px] w-[17px]" alt={alt} />
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
          { key: 'academicCalendar', path: '/calendar/academic' },
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
          { key: 'tuitionFees', path: '/fees' },
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
  const rotation = isRTL
    ? expanded
      ? 'rotate(-90deg)'
      : 'rotate(0deg)'
    : expanded
      ? 'rotate(90deg)'
      : 'rotate(180deg)';

  return (
    <img
      src={SideArrow}
      alt=""
      aria-hidden
      style={{
        width: 5,
        height: 9,
        transition: 'transform .2s ease',
        transform: rotation,
        ...(active ? ICON_FILTER_WHITE : null),
      }}
    />
  );
};

const BadgeView: React.FC<{ badge: MenuBadge }> = ({ badge }) => {
  if (badge.type === 'tag') {
    return (
      <span
        className="rounded-[4px] px-1.5 py-[3px] text-[9px] font-bold leading-none tracking-wider text-white"
        style={{ background: C.lms }}
      >
        {badge.value}
      </span>
    );
  }
  return (
    <span
      className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none"
      style={{ background: '#FFFFFF', color: C.countText }}
    >
      {badge.value}
    </span>
  );
};

const BrandMark: React.FC = () => (
  <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center">
    <CustomImage src={AlNukhbaLogo} alt="School" className="h-[76px] w-[76px]" />
  </div>
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
    <div ref={wrapperRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
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
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              right: coords.right,
              minWidth: 220,
              padding: 8,
              borderRadius: 12,
              background: '#0F1F17',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06)',
              zIndex: 1000,
            }}
          >
            <div
              className={`mb-1 px-3 pb-2 pt-1 text-[12px] font-semibold text-white ${textAlignClass}`}
              style={{ borderBottom: `1px solid rgba(255,255,255,0.10)` }}
            >
              {t(`sidebar.${item.key}`)}
            </div>
            <div className="mt-1 flex flex-col" style={{ gap: 1 }}>
              {item.subItems!.map((sub) => {
                const isSubActive =
                  currentPath === sub.path || currentPath.startsWith(sub.path + '/');
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    onClick={onClose}
                    className={`flex items-center transition-colors ${
                      isSubActive ? '' : 'hover:bg-white/[0.04]'
                    }`}
                    style={{
                      gap: 10,
                      padding: '8px 12px',
                      fontSize: 13,
                      borderRadius: 8,
                      color: isSubActive ? '#ffffff' : '#D6DDD8',
                      fontWeight: isSubActive ? 700 : 400,
                      background: isSubActive ? '#073924' : 'transparent',
                    }}
                  >
                    <span
                      className="flex-shrink-0 rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background: isSubActive ? '#ffffff' : '#8FA89A',
                      }}
                    />
                    <span className={`flex-1 truncate ${textAlignClass}`}>
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
  const [schoolName, setSchoolName] = useState<string>('');
  const [isLoadingSchoolName, setIsLoadingSchoolName] = useState<boolean>(false);
  // Collapse the sidebar to icon-only mode on small screens (< lg).
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 1023px)').matches;
  });
  // Which parent's flyout panel is currently open (collapsed mode only).
  const [flyoutKey, setFlyoutKey] = useState<string | null>(null);

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
      const trackHeight = clientHeight;
      const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * trackHeight);
      const thumbTop = (scrollTop / overflow) * (trackHeight - thumbHeight);
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
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsCollapsed(e.matches);
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Close any open flyout when route changes or when the sidebar uncollapses.
  useEffect(() => {
    setFlyoutKey(null);
  }, [location.pathname, isCollapsed]);

  useEffect(() => {
    if (dashboardType === UserRole.SCHOOL_ADMIN) {
      const branchId = getCurrentSchoolBranchId();
      if (branchId) {
        setIsLoadingSchoolName(true);
        axiosClient
          .get(SchoolsEndpoints.getSchoolBranchMobile(branchId))
          .then((res) => {
            const name = res?.data?.data?.nameBranch;
            if (name) setSchoolName(name);
          })
          .catch(() => {})
          .finally(() => setIsLoadingSchoolName(false));
      }
    }
  }, [dashboardType]);

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

  // Shared geometry for any active inset card (parent pill OR sub-item fill).
  // Using explicit width:calc + box-sizing guarantees parent and sub render
  // at the EXACT same horizontal extent, regardless of borders/padding diffs.
  const PILL_MARGIN_START = 8;
  const PILL_MARGIN_END = 14;
  const PILL_WIDTH = `calc(100% - ${PILL_MARGIN_START + PILL_MARGIN_END}px)`;

  const activeWrapperStyle: React.CSSProperties = {
    display: 'block',
    boxSizing: 'border-box',
    width: PILL_WIDTH,
    background: C.activeGradient,
    color: '#ffffff',
    // Only the start-edge accent (right side in RTL). No outline border on
    // the other three sides — the pill reads from the gradient + shadow alone.
    borderInlineStart: '2px solid #ffffff',
    borderRadius: 10,
    boxShadow: '0 4px 14px rgba(0, 40, 22, 0.4)',
    marginInlineStart: PILL_MARGIN_START,
    marginInlineEnd: PILL_MARGIN_END,
    padding: '11px 16px',
  };

  const inactiveWrapperStyle: React.CSSProperties = {
    display: 'block',
    boxSizing: 'border-box',
    width: '100%',
    color: C.inkDim,
    paddingInlineStart: 28,
    paddingInlineEnd: 16,
    paddingTop: 9,
    paddingBottom: 9,
  };

  const renderRow = (
    item: MenuItem,
    opts: { active: boolean; hasSubItems: boolean; expanded: boolean }
  ) => {
    const { active, hasSubItems, expanded } = opts;
    return (
      <div
        className="grid select-none items-center"
        style={{
          gridTemplateColumns: '22px 1fr auto 14px',
          columnGap: 10,
          fontSize: 14,
          fontWeight: active ? 500 : 400,
          width: '100%',
        }}
      >
        <span
          className="grid h-[22px] w-[22px] place-items-center"
          style={active ? ICON_FILTER_WHITE : ICON_FILTER_MUTE}
        >
          {item.icon}
        </span>
        <span
          className={`truncate ${textAlignClass}`}
          style={{ color: active ? '#ffffff' : C.inkDim, lineHeight: 1.25 }}
        >
          {t(`sidebar.${item.key}`)}
        </span>
        <span className="flex items-center justify-center">
          {item.badge && <BadgeView badge={item.badge} />}
        </span>
        <span
          className="grid h-3.5 w-3.5 place-items-center"
          style={{ color: active ? '#ffffff' : C.inkMute }}
        >
          {hasSubItems && <Chevron expanded={expanded} isRTL={isRTL} active={active} />}
        </span>
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
          className={`flex items-center justify-center py-3 transition-colors ${
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
            className={`cursor-pointer text-start transition-colors ${
              isActive ? '' : 'hover:bg-white/[0.03]'
            }`}
            style={isActive ? activeWrapperStyle : inactiveWrapperStyle}
          >
            {renderRow(item, { active: isActive, hasSubItems: true, expanded: isExpanded })}
          </button>

          {isExpanded && (
            <div className="mt-px overflow-hidden">
              {item.subItems!.map((sub) => {
                const isSubActive =
                  location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    className={`flex cursor-pointer select-none items-center transition-colors ${
                      isSubActive ? '' : 'hover:bg-white/[0.02]'
                    }`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      boxSizing: 'border-box',
                      width: PILL_WIDTH,
                      gap: 10,
                      paddingTop: 9,
                      paddingBottom: 9,
                      paddingInlineStart: 16,
                      paddingInlineEnd: 16,
                      marginInlineStart: PILL_MARGIN_START,
                      marginInlineEnd: PILL_MARGIN_END,
                      marginTop: 2,
                      marginBottom: 2,
                      fontSize: 13,
                      borderRadius: 10,
                      background: isSubActive ? C.subActive : 'transparent',
                    }}
                  >
                    <span
                      className="flex-shrink-0 rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background: isSubActive ? '#ffffff' : C.inkMute,
                      }}
                    />
                    <span
                      className={`flex-1 truncate ${textAlignClass}`}
                      style={{
                        color: isSubActive ? '#ffffff' : C.inkDim,
                        fontWeight: isSubActive ? 700 : 400,
                      }}
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
        className={({ isActive }) => `transition-colors ${isActive ? '' : 'hover:bg-white/[0.03]'}`}
        style={({ isActive }) => (isActive ? activeWrapperStyle : inactiveWrapperStyle)}
      >
        {({ isActive }) =>
          renderRow(item, { active: isActive, hasSubItems: false, expanded: false })
        }
      </NavLink>
    );
  };

  const isSchoolAdmin = dashboardType === UserRole.SCHOOL_ADMIN;

  return (
    <aside
      className={`relative flex flex-shrink-0 flex-col overflow-hidden text-white ${
        isCollapsed ? 'w-[64px]' : 'w-[clamp(240px,17vw,300px)]'
      }`}
      style={{
        background: C.bg,
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
      aria-label="Main navigation"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 280,
          height: 200,
          right: -60,
          top: -40,
          zIndex: 0,
          background:
            'radial-gradient(ellipse 60% 70% at 70% 30%, rgba(103, 203, 160, 0.18) 0%, rgba(83, 159, 126, 0.10) 30%, rgba(15, 31, 23, 0) 70%)',
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 280,
          height: 200,
          left: -60,
          bottom: -40,
          zIndex: 0,
          background:
            'radial-gradient(ellipse 60% 70% at 30% 70%, rgba(103, 203, 160, 0.18) 0%, rgba(83, 159, 126, 0.10) 30%, rgba(15, 31, 23, 0) 70%)',
        }}
      />

      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 401,
          height: 400,
          top: -199,
          left: -164,
          zIndex: 1,
          background: C.blobGradient,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: 401,
          height: 400,
          bottom: -228,
          right: -104,
          zIndex: 1,
          background: C.blobGradient,
        }}
      />

      <div className="relative flex-shrink-0" style={{ zIndex: 3 }}>
        {isCollapsed ? (
          // Collapsed: just the logo centered (the school crest reads on its own).
          <div className="flex items-center justify-center px-2 pb-3 pt-3">
            {isSchoolAdmin ? (
              <BrandMark />
            ) : (
              <CustomImage
                src={GradeXLogo}
                alt="GradeX"
                className="h-9 w-auto"
                style={ICON_FILTER_WHITE}
              />
            )}
          </div>
        ) : isSchoolAdmin ? (
          <div className="flex items-center px-4 pb-4 pt-4">
            <BrandMark />
            <div className="flex min-w-0 flex-col items-center">
              {isLoadingSchoolName && !schoolName ? (
                <>
                  <div
                    className="animate-pulse rounded-md"
                    style={{
                      width: 140,
                      height: 18,
                      background: 'rgba(255,255,255,0.10)',
                    }}
                  />
                  <div
                    className="mt-2 animate-pulse rounded-md"
                    style={{
                      width: 90,
                      height: 12,
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  />
                </>
              ) : (
                <>
                  <div
                    className={`text-[18px] font-bold text-white ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    style={{
                      fontFamily: 'Tajawal, "IBM Plex Sans Arabic", system-ui, sans-serif',
                      lineHeight: 1.4,
                    }}
                  >
                    {schoolName}
                  </div>
                  {t('sidebar.schoolSubtitle', { defaultValue: '' }) && (
                    <div
                      className="mt-1 text-center text-[13px] font-normal"
                      style={{
                        fontFamily: 'Tajawal, "IBM Plex Sans Arabic", system-ui, sans-serif',
                        lineHeight: 1.4,
                        color: C.inkMute,
                      }}
                    >
                      {t('sidebar.schoolSubtitle')}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-[14px] pb-3 pt-[14px]">
            <CustomImage
              src={GradeXLogo}
              alt="GradeX"
              className="h-10 w-auto"
              style={ICON_FILTER_WHITE}
            />
          </div>
        )}

        {/* Top rule — matches the inset and color of the inter-section
            dividers (`margin: 0 22px`, `background: C.rule`). */}
        <div style={{ height: 1, background: C.rule, margin: '0 22px' }} />
      </div>

      {/* Scroll region wrapper — positioning context for the custom scrollbar
          thumb so the thumb only spans the nav area, not the brand header. */}
      <div className="relative min-h-0 flex-1" style={{ zIndex: 2 }}>
        <nav
          ref={navRef}
          className="sidebar-scroll absolute inset-0 overflow-y-auto overflow-x-hidden"
          style={{ padding: '12px 0 16px' }}
          aria-label="primary"
        >
          {sections.map((section, idx) => {
            const showRule = !!section.titleKey && idx > firstTitledIdx;
            // In collapsed mode, every titled section just gets a thin divider
            // line above it — no header text.
            const showCollapsedRule = isCollapsed && !!section.titleKey && idx > 0;

            return (
              <div key={`section-${idx}`} className={idx > 0 ? 'mt-2' : ''}>
                {showCollapsedRule && (
                  <div
                    style={{
                      height: 1,
                      background: C.rule,
                      margin: '8px 14px',
                    }}
                  />
                )}
                {!isCollapsed && showRule && (
                  <div
                    style={{
                      height: 1,
                      background: C.rule,
                      margin: '6px 22px 0',
                    }}
                  />
                )}
                {!isCollapsed && section.titleKey && (
                  <div
                    className={`text-[11px] font-normal ${textAlignClass}`}
                    style={{
                      color: C.inkMute,
                      padding: '12px 28px 8px',
                    }}
                  >
                    {t(`sidebar.${section.titleKey}`)}
                  </div>
                )}
                <div className="flex flex-col" style={{ gap: 1 }}>
                  {section.items.map(renderMenuItem)}
                </div>
              </div>
            );
          })}
        </nav>

        {scroll.visible && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0"
            style={{
              insetInlineEnd: 4,
              width: 4,
              zIndex: 4,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: scroll.thumbTop,
                insetInlineEnd: 0,
                width: 4,
                height: scroll.thumbHeight,
                background: '#e6ece8',
                borderRadius: 999,
                transition: 'background 0.2s ease',
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
