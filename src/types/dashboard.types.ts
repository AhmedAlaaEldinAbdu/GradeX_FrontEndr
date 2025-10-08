import type { UserRoleType } from '@gradex/constants/roles';

/**
 * Dashboard route definition
 */
export interface DashboardRoute {
  path: string;
  component: string;
  label: string;
  icon?: string;
  permission?: string[];
}

/**
 * Complete dashboard configuration structure
 */
export interface DashboardConfig {
  type: UserRoleType;
  basePath: string;
  routes: DashboardRoute[];
  defaultRoute: string;
  features: string[];
}

/**
 * Dashboard navigation item
 */
export interface DashboardNavItem {
  label: string;
  path: string;
  icon?: string;
  children?: DashboardNavItem[];
}
