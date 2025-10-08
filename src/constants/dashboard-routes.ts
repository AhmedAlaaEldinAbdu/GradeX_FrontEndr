/**
 * Dashboard Route Configurations
 * Defines all dashboard routes and configurations for different user roles
 */

import { UserRole } from '@gradex/constants/roles';
import type { DashboardConfig } from '@gradex/types/dashboard.types';

/**
 * Super Admin Dashboard Configuration
 * Access to all schools, system-wide analytics, and management
 */
export const SUPER_ADMIN_DASHBOARD: DashboardConfig = {
  type: UserRole.SUPER_ADMIN,
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
  type: UserRole.SCHOOL_ADMIN,
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
 * All dashboard configurations mapped by role
 */
export const DASHBOARD_CONFIGS: Record<string, DashboardConfig> = {
  [UserRole.SUPER_ADMIN]: SUPER_ADMIN_DASHBOARD,
  [UserRole.SCHOOL_ADMIN]: SCHOOL_ADMIN_DASHBOARD,
};
