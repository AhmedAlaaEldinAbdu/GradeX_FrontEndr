import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { useSchoolBranchName } from '@/hooks/useSchoolBranchName';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchTeacherRequestsSummary } from '@/redux/features/teacher-requests/teacherRequestsSlice';
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
import MainLogo from '@/assets/identity/classtiSchoolSmartLogo.svg';
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

/* ── Figma tokens — Classti / "Aside - Main Navigation Sidebar" (node 107:539) ──
   accent  #1E7A52  active label + icon
   active  #ECFDF5  active row fill
   muted   #9D9D9D  idle label + icon
   heading #1E293B  section header label
   edge    #E2E8F0  sidebar outer border
   rule    #F1F5F9  logo/footer dividers                                      */
const ICON_FILTER_DARK: React.CSSProperties = {
  filter:
    'brightness(0) saturate(100%) invert(13%) sepia(19%) saturate(1121%) hue-rotate(184deg) brightness(95%) contrast(92%)',
};

// Class-based equivalents of the icon filters above, so a row can tint its icon
// on hover via `group-hover:` (inline styles can't be hover-overridden).
// Keep these as full literal strings — Tailwind only generates classes it can see.
// ACTIVE ≈ #1E7A52, MUTE ≈ #9D9D9D.
const ICON_FILTER_ACTIVE_CLASS =
  'filter-[brightness(0)_saturate(100%)_invert(38%)_sepia(24%)_saturate(1234%)_hue-rotate(114deg)_brightness(93%)_contrast(92%)]';
const ICON_FILTER_MUTE_CLASS = 'filter-[brightness(0)_saturate(100%)_invert(62%)]';
const ICON_GROUP_HOVER_ACTIVE =
  'group-hover:filter-[brightness(0)_saturate(100%)_invert(38%)_sepia(24%)_saturate(1234%)_hue-rotate(114deg)_brightness(93%)_contrast(92%)]';

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const SIDEBAR_FONT = "font-['IBM_Plex_Sans_Arabic',sans-serif]";
const SIDEBAR_WIDTH_CLASS = 'w-[256px]';
const SIDEBAR_COLLAPSED_WIDTH_CLASS = 'w-[64px]';
const SIDEBAR_COLLAPSE_STORAGE_KEY = 'gradex.sidebar.collapsed';
const SIDEBAR_SCROLL_TRACK_INSET = 14;
const SIDEBAR_SCROLL_THUMB_MIN_HEIGHT = 28;
// Below the desktop breakpoint (phones + tablets) the sidebar is an off-canvas drawer.
const SIDEBAR_MOBILE_QUERY = '(max-width: 1023px)';

interface SidebarProps {
  dashboardType: UserRoleType;
  customMenuItems?: MenuItem[];
  /** Mobile only: whether the off-canvas drawer is open. */
  isMobileOpen?: boolean;
  /** Mobile only: called when the drawer should close (backdrop, Esc, nav click). */
  onMobileClose?: () => void;
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
      {
        key: 'reports',
        icon: renderIcon(ReportsIcon, 'Reports'),
        path: '/reports',
      },
      { key: 'tickets', icon: renderIcon(TicketsIcon, 'Tickets'), path: '/tickets' },
      {
        key: 'notifications',
        icon: renderIcon(NotificationIcon, 'Notifications'),
        path: '/notifications',
      },
      { key: 'messages', icon: renderIcon(SettingsIcon, 'Messages'), path: '/messages' },
      {
        key: 'settings',
        icon: renderIcon(SettingsIcon, 'Settings'),
        path: '/settings',
      },
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
          // { key: 'questionBank', path: '/lms/question-bank' },
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

/**
 * Read the pending-requests count from the (placeholder) TeacherRequests summary.
 * TODO(api): confirm the field name once the summary response schema is provided.
 */
const getPendingRequestsCount = (summary: Record<string, unknown> | null): number => {
  if (!summary) return 0;
  const candidate =
    summary.pending ??
    summary.pendingCount ??
    summary.pendingRequests ??
    summary.waitingCount ??
    summary.underReviewCount;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : 0;
};

/* Chevron — uses the SideArrow.svg asset, rotated to match direction
   and expand/collapse state. SideArrow's native shape points LEFT (<),
   so rotations are computed relative to that:
     RTL collapsed → 0deg   (<)
     RTL expanded  → -90deg (v)
     LTR collapsed → 180deg (>)
     LTR expanded  →  90deg (v)
   When the row is active the icon is tinted brand green; otherwise it is
   filtered to the muted grey used by inactive icons. */
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
        'h-[10px] w-[6px] shrink-0 object-contain transition-transform duration-200',
        rotationClass,
        active ? ICON_FILTER_ACTIVE_CLASS : cn(ICON_FILTER_MUTE_CLASS, ICON_GROUP_HOVER_ACTIVE)
      )}
    />
  );
};

const BadgeView: React.FC<{ badge: MenuBadge }> = ({ badge }) => {
  if (badge.type === 'tag') {
    // Figma LMS chip: padding 2px 8px, bg #00BC7D, radius 4,
    return (
      <span className="inline-flex h-[19px] shrink-0 items-center justify-center rounded-[4px] bg-[#1E7A52] px-[8px] py-[2px] text-[10px] leading-[15px] font-bold text-white">
        {badge.value}
      </span>
    );
  }
  // Count badge — Figma header bell badge: 14×14, #EF4444, radius 7, 10 / 500 white.
  return (
    <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-[7px] bg-[#EF4444] text-center text-[10px] leading-[13px] font-medium text-white">
      {badge.value}
    </span>
  );
};

const BrandMark: React.FC = () => (
  <CustomImage src={MainLogo} alt="Classti" className="h-[30px] w-[100px] object-contain" />
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
        className={`group flex w-full items-center justify-center rounded-[8px] py-3 transition-colors ${
          isActive ? 'bg-[#ECFDF5]' : isOpen ? 'bg-[#F1F5F9]' : 'hover:bg-[#ECFDF5]'
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
            className="fixed z-1000 min-w-[220px] rounded-[12px] border border-[#E2E8F0] bg-white p-[8px] shadow-[0px_1px_2px_rgba(12,12,13,0.1),0px_4px_16px_rgba(12,12,13,0.08)]"
            style={{
              top: coords.top,
              left: coords.left,
              right: coords.right,
            }}
          >
            <div
              className={`mb-1 border-b border-[#F1F5F9] px-3 pt-1 pb-2 text-[16px] leading-[22.4px] font-semibold text-[#1E293B] ${textAlignClass}`}
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
                      'group box-border flex items-center gap-[8px] rounded-[8px] p-[8px] text-[14px] leading-[19.6px] font-medium transition-colors',
                      'flex-row',
                      isSubActive
                        ? 'bg-[#ECFDF5] text-[#1E7A52]'
                        : 'text-[#9D9D9D] hover:bg-[#ECFDF5] hover:text-[#1E7A52]'
                    )}
                  >
                    <span
                      className={cn(
                        'h-[5px] w-[5px] shrink-0 rounded-full transition-colors',
                        isSubActive ? 'bg-[#1E7A52]' : 'bg-transparent group-hover:bg-[#1E7A52]'
                      )}
                    />
                    <span
                      className={cn('flex-1 truncate', textAlignClass, isSubActive && 'font-bold')}
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
const Sidebar: React.FC<SidebarProps> = ({
  dashboardType,
  customMenuItems,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const adminRequestsSummary = useAppSelector((state) => state.teacherRequests.summary);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Pull the admin-requests summary so the sidebar badge can show the pending count.
  useEffect(() => {
    if (dashboardType !== UserRole.SUPER_ADMIN) {
      dispatch(fetchTeacherRequestsSummary());
    }
  }, [dispatch, dashboardType]);

  // Shared cached fetch — Header consumes the same hook so the network call is deduped.
  // The locals are kept named so the (currently commented) JSX block that displays them
  // stays compatible if it's restored.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { name: _schoolName, isLoading: _isLoadingSchoolName } = useSchoolBranchName();
  const [hasUserOverride, setHasUserOverride] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY) !== null;
  });
  const [isCollapsedPref, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSE_STORAGE_KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
    return window.matchMedia('(max-width: 1023px)').matches;
  });
  // Phones and tablets get an off-canvas drawer instead of the collapsed rail; the drawer is always
  // rendered expanded, so the rail preference is ignored there.
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(SIDEBAR_MOBILE_QUERY).matches;
  });
  const isCollapsed = isCollapsedPref && !isMobile;

  useEffect(() => {
    const mq = window.matchMedia(SIDEBAR_MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Drawer state belongs to the parent; make sure it can't stay "open" once we leave mobile.
  useEffect(() => {
    if (!isMobile && isMobileOpen) onMobileClose?.();
  }, [isMobile, isMobileOpen, onMobileClose]);

  useEffect(() => {
    if (!isMobile || !isMobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobile, isMobileOpen, onMobileClose]);

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
  const scrollbarThumbRef = useRef<HTMLDivElement | null>(null);
  const pendingExpandedKeyRef = useRef<string | null>(null);
  const scrollDragRef = useRef<{
    startY: number;
    startScrollTop: number;
    scrollable: number;
    movable: number;
  } | null>(null);
  const [scroll, setScroll] = useState<{
    visible: boolean;
    thumbTop: number;
    thumbHeight: number;
  }>({ visible: false, thumbTop: 0, thumbHeight: 0 });
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false);

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
      const trackHeight = Math.max(0, clientHeight - SIDEBAR_SCROLL_TRACK_INSET * 2);
      const thumbHeight = Math.max(
        SIDEBAR_SCROLL_THUMB_MIN_HEIGHT,
        (clientHeight / scrollHeight) * trackHeight
      );
      const thumbTop =
        SIDEBAR_SCROLL_TRACK_INSET + (scrollTop / overflow) * (trackHeight - thumbHeight);
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
    if (!isScrollbarDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const drag = scrollDragRef.current;
      const nav = navRef.current;
      if (!drag || !nav || drag.movable <= 0) return;

      const scrollDelta = ((event.clientY - drag.startY) / drag.movable) * drag.scrollable;
      nav.scrollTop = clamp(drag.startScrollTop + scrollDelta, 0, drag.scrollable);
    };

    const handleMouseUp = () => {
      scrollDragRef.current = null;
      setIsScrollbarDragging(false);
    };

    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrollbarDragging]);

  const startScrollbarDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const nav = navRef.current;
    if (!nav) return;

    const { scrollHeight, clientHeight } = nav;
    const scrollable = scrollHeight - clientHeight;
    const trackHeight = Math.max(0, clientHeight - SIDEBAR_SCROLL_TRACK_INSET * 2);
    const movable = trackHeight - scroll.thumbHeight;
    if (scrollable <= 1 || movable <= 0) return;

    const trackRect = event.currentTarget.getBoundingClientRect();
    const thumbRect = scrollbarThumbRef.current?.getBoundingClientRect();
    const clickedThumb =
      !!thumbRect && event.clientY >= thumbRect.top && event.clientY <= thumbRect.bottom;

    if (!clickedThumb) {
      const nextThumbTop = clamp(
        event.clientY - trackRect.top - scroll.thumbHeight / 2,
        SIDEBAR_SCROLL_TRACK_INSET,
        SIDEBAR_SCROLL_TRACK_INSET + movable
      );
      nav.scrollTop = ((nextThumbTop - SIDEBAR_SCROLL_TRACK_INSET) / movable) * scrollable;
    }

    scrollDragRef.current = {
      startY: event.clientY,
      startScrollTop: nav.scrollTop,
      scrollable,
      movable,
    };
    setIsScrollbarDragging(true);
    event.preventDefault();
  };

  const scrollExpandedMenuIntoView = useCallback((key: string) => {
    const nav = navRef.current;
    const menu = nav?.querySelector<HTMLElement>(`[data-sidebar-menu-key="${key}"]`);
    if (!nav || !menu) return;

    const navRect = nav.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const viewportPadding = 12;
    const topDelta = menuRect.top - navRect.top;
    const bottomDelta = menuRect.bottom - navRect.bottom;

    if (topDelta < viewportPadding) {
      nav.scrollBy({ top: topDelta - viewportPadding, behavior: 'smooth' });
    } else if (bottomDelta > -viewportPadding) {
      nav.scrollBy({ top: bottomDelta + viewportPadding, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const key = pendingExpandedKeyRef.current;
    if (!key || isCollapsed || !expandedItems.includes(key)) return;

    const frame = window.requestAnimationFrame(() => {
      scrollExpandedMenuIntoView(key);
      pendingExpandedKeyRef.current = null;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [expandedItems, isCollapsed, scrollExpandedMenuIntoView]);

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

  const pendingRequestsCount = getPendingRequestsCount(
    adminRequestsSummary as Record<string, unknown> | null
  );

  const baseSections: MenuSection[] = customMenuItems
    ? [{ items: customMenuItems }]
    : getSectionsForDashboard(dashboardType);

  // Override the static admin-requests badge with the live pending count
  // (hidden when there are none).
  const sections: MenuSection[] = baseSections.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.key === 'adminRequests'
        ? {
            ...item,
            badge:
              pendingRequestsCount > 0 ? { type: 'count', value: pendingRequestsCount } : undefined,
          }
        : item
    ),
  }));

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

  // On page load (reload) only — not on later navigations — bring the active row into
  // view inside the nav scroller. Sub-items only mount once their parent is expanded,
  // so retry until the row exists.
  const hasScrolledToActiveRef = useRef(false);
  useEffect(() => {
    if (isCollapsed || hasScrolledToActiveRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      const nav = navRef.current;
      const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!nav || !active) return;

      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const offsetInNav = activeRect.top - navRect.top + nav.scrollTop;
      nav.scrollTo({
        top: Math.max(0, offsetInNav - (nav.clientHeight - activeRect.height) / 2),
      });
      hasScrolledToActiveRef.current = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [expandedItems, isCollapsed]);

  const toggleExpand = (key: string) => {
    const isExpanded = expandedItems.includes(key);
    if (isExpanded) {
      setExpandedItems((prev) => prev.filter((k) => k !== key));
    } else {
      pendingExpandedKeyRef.current = key;
      setExpandedItems([key]);
    }
  };

  const textAlignClass = isRTL ? 'text-right' : 'text-left';
  const rowDirectionClass = 'flex-row';
  const menuItemsAlignClass = isRTL ? 'items-start' : 'items-end';

  /* Two row scales from the Figma frame:
     - `primary` = the "Home Link" (rounded 12, 8/12 padding, 18 / bold, 20px icon)
       used by the leading untitled section;
     - `link`    = the "Link" row (rounded 8, 8 padding, 14 / medium, 16px icon)
       used by every titled section below it.                                    */
  type RowVariant = 'primary' | 'link';
  const getMainItemClass = (active: boolean, variant: RowVariant) =>
    cn(
      'group relative box-border flex w-full shrink-0 items-center justify-between border-0 text-start outline-hidden transition-colors',
      variant === 'primary'
        ? 'gap-[12px] rounded-[12px] px-[8px] py-[12px]'
        : 'rounded-[8px] p-[8px]',
      rowDirectionClass,
      active
        ? 'bg-[#ECFDF5] text-[#1E7A52]'
        : 'bg-transparent text-[#9D9D9D] hover:bg-[#ECFDF5] hover:text-[#1E7A52]'
    );

  const renderRow = (
    item: MenuItem,
    opts: { active: boolean; hasSubItems: boolean; expanded: boolean; variant: RowVariant }
  ) => {
    const { active, hasSubItems, expanded, variant } = opts;
    const hasTrailingGroup = !!item.badge || hasSubItems;
    const isPrimary = variant === 'primary';
    return (
      <div
        className={cn(
          'flex w-full items-center justify-between select-none',
          isPrimary
            ? 'gap-[12px] text-[18px] leading-[20px] font-bold'
            : 'gap-[16px] text-[14px] leading-[19.6px] font-medium',
          rowDirectionClass
        )}
      >
        <div
          className={cn(
            'flex min-w-0 items-center gap-[8px]',
            isPrimary && 'gap-[12px]',
            rowDirectionClass
          )}
        >
          <span
            className={cn(
              'grid shrink-0 place-items-center',
              isPrimary ? 'h-5 w-5' : 'h-4 w-4',
              active
                ? ICON_FILTER_ACTIVE_CLASS
                : cn(ICON_FILTER_MUTE_CLASS, ICON_GROUP_HOVER_ACTIVE)
            )}
          >
            {item.icon}
          </span>
          <span
            className={cn(
              'truncate',
              textAlignClass,
              active ? 'text-[#1E7A52]' : 'text-[#9D9D9D] group-hover:text-[#1E7A52]'
            )}
          >
            {t(`sidebar.${item.key}`)}
          </span>
        </div>

        {hasTrailingGroup && (
          <div className="flex shrink-0 items-center gap-px">
            {item.badge && <BadgeView badge={item.badge} />}
            {hasSubItems && (
              <span className="grid h-[16px] w-[16px] place-items-center">
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
        className={cn(
          'grid h-6 w-6 place-items-center',
          isActive ? ICON_FILTER_ACTIVE_CLASS : cn(ICON_FILTER_MUTE_CLASS, ICON_GROUP_HOVER_ACTIVE)
        )}
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
          className={`group flex w-full items-center justify-center rounded-[8px] py-3 transition-colors ${
            isActive ? 'bg-[#ECFDF5]' : 'hover:bg-[#ECFDF5]'
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

  const renderMenuItem = (item: MenuItem, variant: RowVariant = 'link') => {
    if (isCollapsed) return renderCollapsedItem(item);

    const isExpanded = expandedItems.includes(item.key);
    const hasSubItems = !!(item.subItems && item.subItems.length > 0);
    const isAnySubItemActive =
      hasSubItems &&
      item.subItems!.some(
        (s) => location.pathname === s.path || location.pathname.startsWith(s.path + '/')
      );

    if (hasSubItems) {
      const isActive = isAnySubItemActive;

      return (
        <div key={item.key} data-sidebar-menu-key={item.key} className="w-full">
          <button
            type="button"
            onClick={() => toggleExpand(item.key)}
            className={cn('cursor-pointer', getMainItemClass(isActive, variant))}
          >
            {renderRow(item, {
              active: isActive,
              hasSubItems: true,
              expanded: isExpanded,
              variant,
            })}
          </button>

          {isExpanded && (
            <div className="mt-[4px] flex flex-col gap-[2px] overflow-hidden px-[8px]">
              {item.subItems!.map((sub) => {
                const isSubActive =
                  location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    className={cn(
                      'group box-border flex w-full cursor-pointer items-center gap-[8px] rounded-[8px] p-[8px] text-[14px] leading-[19.6px] font-medium transition-colors select-none',
                      rowDirectionClass,
                      isSubActive
                        ? 'bg-[#ECFDF5] text-[#1E7A52]'
                        : 'text-[#9D9D9D] hover:bg-[#ECFDF5] hover:text-[#1E7A52]'
                    )}
                  >
                    <span
                      className={cn(
                        'h-[5px] w-[5px] shrink-0 rounded-full transition-colors',
                        isSubActive ? 'bg-[#1E7A52]' : 'bg-transparent group-hover:bg-[#1E7A52]'
                      )}
                    />
                    <span
                      className={cn('flex-1 truncate', textAlignClass, isSubActive && 'font-bold')}
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
        className={({ isActive }) => getMainItemClass(isActive, variant)}
      >
        {({ isActive }) =>
          renderRow(item, { active: isActive, hasSubItems: false, expanded: false, variant })
        }
      </NavLink>
    );
  };

  const sidebarWidthClass = isCollapsed ? SIDEBAR_COLLAPSED_WIDTH_CLASS : SIDEBAR_WIDTH_CLASS;

  return (
    <>
      {/* Mobile backdrop: darkens the page behind the drawer; tapping it closes the drawer. */}
      {isMobile && (
        <div
          aria-hidden
          onClick={onMobileClose}
          className={cn(
            'fixed inset-0 z-55 bg-[rgba(0,0,0,0.6)] transition-opacity duration-300 ease-out',
            isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
        />
      )}

      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed inset-y-0 flex h-dvh flex-col overflow-hidden bg-white text-[#1E293B]',
          'drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] duration-300 ease-out',
          isRTL ? 'right-0 border-l border-[#E2E8F0]' : 'left-0 border-r border-[#E2E8F0]',
          SIDEBAR_FONT,
          isMobile
            ? cn(
                // Off-canvas drawer, slides in from the sidebar edge:
                // 85% of the screen on phones, 50% on tablets (md → lg).
                // Tailwind v4 `translate-x-*` animates the `translate` property, not `transform`.
                'z-60 w-[85vw] transition-[translate,visibility] md:w-[50vw]',
                isMobileOpen
                  ? 'visible translate-x-0'
                  : cn('invisible', isRTL ? 'translate-x-full' : '-translate-x-full')
              )
            : cn('z-40 transition-[width]', sidebarWidthClass)
        )}
        aria-label="Main navigation"
      >
        <div className="relative z-4 flex w-full shrink-0 items-center justify-center border-b border-solid border-[#F1F5F9] px-[16px] pt-[16px] pb-[17px]">
          {isCollapsed ? (
            <CustomImage
              src={ClasstiLogo}
              alt="Classti"
              className="h-[30px] w-[30px] object-contain"
            />
          ) : (
            <BrandMark />
          )}
        </div>

        {/* Scroll region wrapper for the custom nav-only scrollbar. */}
        <div className="relative z-2 min-h-0 flex-1">
          <nav
            ref={navRef}
            className="absolute inset-0 sidebar-scroll overflow-x-hidden overflow-y-auto px-[12px] py-[16px]"
            aria-label="primary"
            // Mobile: choosing a page (any link, even the current one) closes the drawer.
            // Accordion parents are buttons, so they stay open-able without closing it.
            onClick={(e) => {
              if (isMobile && (e.target as HTMLElement).closest('a')) onMobileClose?.();
            }}
          >
            {sections.map((section, idx) => {
              const showRule = !!section.titleKey && idx > firstTitledIdx;
              // In collapsed mode, titled sections use only a divider.
              const showCollapsedRule = isCollapsed && !!section.titleKey && idx > 0;
              // Figma's oversized "Home Link" scale belongs to a lone untitled lead
              // section only — a multi-item untitled section (super admin) stays on
              // the regular link scale.
              const isPrimarySection = !section.titleKey && section.items.length === 1;

              return (
                <div key={`section-${idx}`} className={idx > 0 ? 'mt-[8px]' : ''}>
                  {showCollapsedRule && (
                    <div className="mx-auto my-[8px] h-px w-[32px] bg-[#F1F5F9]" />
                  )}
                  {/* Figma "Line": full-bleed across the 256px aside, 8px gap each side. */}
                  {!isCollapsed && showRule && (
                    <div className="mx-[-12px] mb-[8px] h-px bg-[#F1F5F9]" />
                  )}
                  {!isCollapsed && section.titleKey && (
                    <div
                      className={cn(
                        'flex items-center rounded-[8px] px-[12px] py-[8px] text-[16px] leading-[22.4px] font-semibold text-[#1E293B]',
                        textAlignClass
                      )}
                    >
                      {t(`sidebar.${section.titleKey}`)}
                    </div>
                  )}
                  {/* Figma "Subitems": titled groups are inset 8px with a 2px row gap. */}
                  <div
                    className={cn(
                      'flex flex-col',
                      isCollapsed
                        ? 'items-stretch gap-[4px]'
                        : cn(
                            menuItemsAlignClass,
                            section.titleKey ? 'mt-[4px] gap-[2px] px-[8px]' : 'gap-[4px]'
                          )
                    )}
                  >
                    {section.items.map((menuItem) =>
                      renderMenuItem(menuItem, isPrimarySection ? 'primary' : 'link')
                    )}
                  </div>
                </div>
              );
            })}
          </nav>

          {scroll.visible && (
            <div
              className={cn(
                'absolute inset-y-0 z-4 w-[12px] cursor-pointer',
                isRTL ? 'left-0' : 'right-0'
              )}
              onMouseDown={startScrollbarDrag}
            >
              <div className="absolute inset-y-[14px] left-[4px] w-[3px] rounded-[8px] bg-[#F1F5F9]" />
              <div
                ref={scrollbarThumbRef}
                className={cn(
                  'absolute left-[4px] w-[3px] rounded-[8px] bg-[#E2E8F0] transition-colors hover:bg-[#1E7A52]',
                  isScrollbarDragging && 'bg-[#1E7A52]'
                )}
                style={{
                  top: scroll.thumbTop,
                  height: scroll.thumbHeight,
                }}
              />
            </div>
          )}
        </div>
      </aside>

      {!isMobile && (
        <button
          type="button"
          onClick={handleToggleCollapsed}
          aria-label={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          className={cn(
            'group fixed top-[60px] z-50 grid h-[26px] w-[26px] place-items-center rounded-full',
            'border border-[#E2E8F0] bg-white text-[#1E293B]',
            'shadow-[0px_1px_2px_rgba(12,12,13,0.1),0px_1px_2px_rgba(12,12,13,0.05)]',
            'transition-[left,right,background-color,border-color,box-shadow,transform] duration-300 ease-out',
            'hover:border-[#1E7A52] hover:bg-[#ECFDF5]',
            'hover:shadow-[0px_2px_8px_rgba(30,122,82,0.16)]',
            'focus-visible:ring-2 focus-visible:ring-[#1E7A52]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-hidden',
            'active:scale-[0.94]'
          )}
          style={{
            [isRTL ? 'right' : 'left']: isCollapsed ? '51px' : '243px',
          }}
        >
          {/* Soft emerald halo on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-[-4px] rounded-full bg-[radial-gradient(circle_at_center,rgba(30,122,82,0.14),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
            style={ICON_FILTER_DARK}
          />
        </button>
      )}

      {/* Layout spacer for the fixed desktop/tablet sidebar; the mobile drawer overlays instead. */}
      {!isMobile && (
        <div
          aria-hidden
          className={cn(
            'h-dvh shrink-0 transition-[width] duration-300 ease-out',
            sidebarWidthClass
          )}
        />
      )}
    </>
  );
};

export default Sidebar;
