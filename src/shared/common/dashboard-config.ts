export const DashboardRole = {
  SUPER_ADMIN: 'super-admin',
  SCHOOL_ADMIN: 'school-admin',
} as const;

export type DashboardRoleType = (typeof DashboardRole)[keyof typeof DashboardRole];

export interface DashboardRoute {
  path: string;
  component: string;
  label: string;
  icon?: string;
  permission?: string[];
}

export interface DashboardConfig {
  type: DashboardRoleType;
  basePath: string;
  routes: DashboardRoute[];
  defaultRoute: string;
  features: string[];
}

/**
 * Super Admin Dashboard Configuration
 * Access to all schools, system-wide analytics, and management
 */
export const SUPER_ADMIN_DASHBOARD: DashboardConfig = {
  type: DashboardRole.SUPER_ADMIN,
  basePath: '/super-admin',
  defaultRoute: '/super-admin/dashboard',
  features: ['schools-management', 'system-analytics', 'user-management', 'reports', 'settings'],
  routes: [
    {
      path: '/super-admin/dashboard',
      component: 'SuperAdminDashboardPage',
      label: 'dashboard.home',
      icon: 'Home',
    },
    {
      path: '/super-admin/schools',
      component: 'SchoolsPage',
      label: 'dashboard.schools',
      icon: 'School',
    },
    {
      path: '/super-admin/analytics',
      component: 'AnalyticsPage',
      label: 'dashboard.analytics',
      icon: 'Reports',
    },
    {
      path: '/super-admin/users',
      component: 'UserManagementPage',
      label: 'dashboard.users',
      icon: 'PeopleRegular',
    },
  ],
};

/**
 * School Admin Dashboard Configuration
 * School-specific management and monitoring
 */
export const SCHOOL_ADMIN_DASHBOARD: DashboardConfig = {
  type: DashboardRole.SCHOOL_ADMIN,
  basePath: '/school',
  defaultRoute: '/school/dashboard',
  features: [
    'student-management',
    'teacher-management',
    'attendance',
    'academic-calendar',
    'reports',
  ],
  routes: [
    {
      path: '/school/dashboard',
      component: 'SchoolDashboardPage',
      label: 'dashboard.home',
      icon: 'Home',
    },
    {
      path: '/school/students',
      component: 'StudentManagementPage',
      label: 'dashboard.students',
      icon: 'Students',
    },
    {
      path: '/school/attendance',
      component: 'AttendancePage',
      label: 'dashboard.attendance',
      icon: 'Tickets',
    },
    {
      path: '/school/teachers',
      component: 'TeachersPage',
      label: 'dashboard.teachers',
      icon: 'PeopleRegular',
    },
  ],
};

/**
 * Get dashboard configuration by type
 */
export const getDashboardConfig = (type: DashboardRoleType): DashboardConfig | null => {
  switch (type) {
    case DashboardRole.SUPER_ADMIN:
      return SUPER_ADMIN_DASHBOARD;
    case DashboardRole.SCHOOL_ADMIN:
      return SCHOOL_ADMIN_DASHBOARD;
    default:
      return null;
  }
};

/**
 * Get dashboard type from user role
 */
export const getDashboardTypeFromRole = (role: string): DashboardRoleType => {
  const roleMap: Record<string, DashboardRoleType> = {
    'super-admin': DashboardRole.SUPER_ADMIN,
    admin: DashboardRole.SUPER_ADMIN,
    'school-admin': DashboardRole.SCHOOL_ADMIN,
  };

  return roleMap[role.toLowerCase()] || DashboardRole.SCHOOL_ADMIN;
};
