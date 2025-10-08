import { UserRole } from '@gradex/constants/roles';
import type { UserRoleType } from '@gradex/constants/roles';
import { DASHBOARD_CONFIGS } from '@gradex/constants/dashboard-routes';
import type { DashboardConfig } from '@gradex/types/dashboard.types';

export const getDashboardConfig = (type: UserRoleType): DashboardConfig | null => {
  return DASHBOARD_CONFIGS[type] || null;
};

export const getDashboardTypeFromRole = (role: string): UserRoleType => {
  const roleMap: Record<string, UserRoleType> = {
    'super-admin': UserRole.SUPER_ADMIN,
    admin: UserRole.SUPER_ADMIN,
    'school-admin': UserRole.SCHOOL_ADMIN,
  };

  return roleMap[role.toLowerCase()] || UserRole.SCHOOL_ADMIN;
};

export const hasFeatureAccess = (role: UserRoleType, feature: string): boolean => {
  const config = getDashboardConfig(role);
  return config?.features.includes(feature) || false;
};

export const getDefaultRoute = (role: UserRoleType): string | null => {
  const config = getDashboardConfig(role);
  return config?.defaultRoute || null;
};

export const getAccessibleRoutes = (role: UserRoleType): string[] => {
  const config = getDashboardConfig(role);
  return config?.routes.map((route) => route.path) || [];
};
