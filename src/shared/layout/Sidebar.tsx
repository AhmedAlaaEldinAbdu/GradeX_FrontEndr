import React, { useState, useEffect } from 'react';
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
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import EducationIcon from '@gradex/assets/icons/Education.svg';
import NotificationIcon from '@gradex/assets/icons/Notification.svg';
import PeopleRegularIcon from '@gradex/assets/icons/PeopleRegular.svg';
import TicketsIcon from '@gradex/assets/icons/Tickets.svg';
import ReportIcon from '@gradex/assets/icons/Report.svg';
import ReportsIcon from '@gradex/assets/icons/Reports.svg';
import SettingsIcon from '@gradex/assets/icons/Settings.svg';
import StudentsIcon from '@gradex/assets/icons/Students.svg';
import WalletIcon from '@gradex/assets/icons/Wallet.svg';
import ContactIcon from '@gradex/assets/icons/Contact.svg';
import SchoolRegularIcon from '@gradex/assets/icons/SchoolRegular.svg';
import AlNukhbaLogo from '@/assets/identity/AlNukhbaLogo.svg';
import GradeXLogo from '@gradex/assets/identity/GradeX.svg';

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
    'radial-gradient(circle at 50% 50%, rgba(0, 200, 130, 1) 0%, rgba(0, 130, 80, 0.5) 35%, rgba(15, 31, 23, 0) 70%)',
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
        icon: renderIcon(BookIcon, 'Educational Stages'),
        subItems: [
          { key: 'stagesClassrooms', path: '/classrooms' },
          { key: 'subjects', path: '/subjects' },
          { key: 'books', path: '/books' },
        ],
      },
      {
        key: 'lms',
        icon: renderIcon(EducationIcon, 'E-Learning'),
        path: '/lms',
        badge: { type: 'tag', value: 'LMS' },
      },
      {
        key: 'calendarManagement',
        icon: renderIcon(CalendarIcon, 'Academic Calendar'),
        subItems: [
          { key: 'tasks', path: '/calendar/tasks' },
          { key: 'preparations', path: '/calendar/preparations' },
          { key: 'weeklyCalendar', path: '/calendar/weekly' },
          { key: 'monthlyCalendar', path: '/calendar/monthly' },
          { key: 'academicCalendar', path: '/calendar/academic' },
        ],
      },
      {
        key: 'examResults',
        icon: renderIcon(ReportIcon, 'Exam Results'),
        path: '/exam-results',
      },
    ],
  },
  {
    titleKey: 'studentAffairs',
    items: [
      {
        key: 'studentManagement',
        icon: renderIcon(StudentsIcon, 'Student Management'),
        subItems: [
          { key: 'students', path: '/students' },
          { key: 'studentApplications', path: '/student-applications' },
          { key: 'interviews', path: '/student-interviews' },
          { key: 'registrationAnnouncement', path: '/registration-announcement' },
        ],
      },
      {
        key: 'requests',
        icon: renderIcon(ReportIcon, 'Requests'),
        path: '/requests',
        badge: { type: 'count', value: 1 },
      },
      {
        key: 'busManagement',
        icon: renderIcon(BusIcon, 'School Transport'),
        path: '/bus-management',
      },
    ],
  },
  {
    titleKey: 'humanResources',
    items: [
      {
        key: 'teachingStaff',
        icon: renderIcon(ContactIcon, 'Staff'),
        subItems: [
          { key: 'staff', path: '/teaching-staff' },
          { key: 'jobAnnouncements', path: '/job-announcements' },
          { key: 'interviews', path: '/interviews' },
        ],
      },
      { key: 'attendance', icon: renderIcon(TicketsIcon, 'Attendance'), path: '/attendance' },
      {
        key: 'adminRequests',
        icon: renderIcon(ReportsIcon, 'Admin Requests'),
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
        icon: renderIcon(WalletIcon, 'Financial Management'),
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

/* Chevron — single icon rotated when expanded (matches standalone CSS) */
const Chevron: React.FC<{ expanded: boolean; isRTL: boolean }> = ({ expanded, isRTL }) => (
  <svg
    width="9"
    height="9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transition: 'transform .2s ease',
      transform: expanded ? (isRTL ? 'rotate(-90deg)' : 'rotate(90deg)') : 'none',
    }}
  >
    {isRTL ? <polyline points="15 6 9 12 15 18" /> : <polyline points="9 6 15 12 9 18" />}
  </svg>
);

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

/* Brand mark — local AlNukhba SVG. The SVG ships with white raster pixels
   around the crest; `mix-blend-mode: multiply` blends those white pixels
   into the dark sidebar background so only the colored emblem reads. */
const BrandMark: React.FC = () => (
  <div
    className="flex h-16 w-16 flex-shrink-0 items-center justify-center"
    style={{ isolation: 'isolate' }}
  >
    <CustomImage
      src={AlNukhbaLogo}
      alt="School"
      className="h-16 w-16"
      style={{ mixBlendMode: 'multiply' }}
    />
  </div>
);

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

  useEffect(() => {
    if (dashboardType === UserRole.SCHOOL_ADMIN) {
      const branchId = getCurrentSchoolBranchId();
      if (branchId) {
        axiosClient
          .get(SchoolsEndpoints.getSchoolBranchMobile(branchId))
          .then((res) => {
            const name = res?.data?.data?.nameBranch;
            if (name) setSchoolName(name);
          })
          .catch(() => {});
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
          fontSize: 12,
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
          {hasSubItems && <Chevron expanded={expanded} isRTL={isRTL} />}
        </span>
      </div>
    );
  };

  const renderMenuItem = (item: MenuItem) => {
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
                      fontSize: 12,
                      borderRadius: 10,
                      background: isSubActive ? C.subActive : 'transparent',
                    }}
                  >
                    {/* Bullet on START side (right in RTL, left in LTR) */}
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
      className="relative flex w-[240px] flex-col overflow-hidden text-white"
      style={{
        background: C.bg,
        boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
      }}
      aria-label="Main navigation"
    >
      {/* Decorative gradient blobs */}
      <span
        aria-hidden
        className="pointer-events-none absolute z-0 rounded-full"
        style={{
          width: 401,
          height: 400,
          top: -200,
          left: -164,
          opacity: 0.18,
          background: C.blobGradient,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute z-0 rounded-full"
        style={{
          width: 401,
          height: 400,
          bottom: -200,
          left: -67,
          opacity: 0.18,
          background: C.blobGradient,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0"
        style={{
          width: 220,
          height: 90,
          opacity: 0.35,
          mixBlendMode: 'screen',
          zIndex: 1,
          background:
            'radial-gradient(180px 60px at 100% 0%, rgba(80,200,150,0.25), transparent 60%), radial-gradient(220px 80px at 60% -20px, rgba(80,200,150,0.12), transparent 60%)',
        }}
      />

      {/* Brand (sticky top) */}
      <div className="relative flex-shrink-0" style={{ zIndex: 3, background: C.bg }}>
        {isSchoolAdmin ? (
          // Grid columns: [logo 44px] [text 1fr]. In RTL the first column
          // (logo) renders on the RIGHT — matches the screenshot. In LTR the
          // logo stays on the LEFT (typical pattern).
          <div
            className="grid items-center gap-[10px] px-[14px] pb-[14px] pt-[16px]"
            style={{ gridTemplateColumns: '64px 1fr' }}
          >
            <BrandMark />
            <div className="min-w-0">
              <div
                className={`truncate text-[14px] font-bold leading-tight text-white ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                {schoolName ||
                  t(
                    'sidebar.defaultSchoolName',
                    isRTL ? 'مدرسة ريما العالمية' : 'Rima International School'
                  )}
              </div>
              <div
                className={`mt-1 truncate text-[10px] font-normal ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
                style={{ color: C.inkMute }}
              >
                {t('sidebar.schoolSubtitle', isRTL ? 'عالمي - أمريكي' : 'International - American')}
              </div>
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

        {/* Top rule */}
        <div className="mx-2" style={{ height: 1, background: C.line }} />
      </div>

      {/* Scrollable nav — custom emerald scrollbar lives on the inline-end edge */}
      <nav
        className="sidebar-scroll relative flex-1 overflow-y-auto overflow-x-hidden"
        style={{ zIndex: 2, padding: '12px 0 16px' }}
        aria-label="primary"
      >
        {sections.map((section, idx) => {
          const showRule = !!section.titleKey && idx > firstTitledIdx;
          return (
            <div key={`section-${idx}`} className={idx > 0 ? 'mt-2' : ''}>
              {showRule && (
                <div
                  style={{
                    height: 1,
                    background: C.rule,
                    margin: '6px 22px 0',
                  }}
                />
              )}
              {section.titleKey && (
                <div
                  className={`text-[10px] font-normal ${textAlignClass}`}
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
    </aside>
  );
};

export default Sidebar;
