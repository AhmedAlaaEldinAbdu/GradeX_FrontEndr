import type { RootState } from '@gradex/redux/store/store';
import { UserRole, type UserRoleType } from '@gradex/constants';
import { getDashboardTypeFromRole } from '@gradex/shared/common/dashboard-config';

/**
 * AuthSelectors
 * Selectors for accessing auth state
 */
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectToken = (state: RootState) => state.auth.token;

/**
 * Get user role
 */
export const selectUserRole = (state: RootState) => state.auth.user?.role || null;

/**
 * Get dashboard type based on user role
 */
export const selectDashboardType = (state: RootState): UserRoleType | null => {
  const user = state.auth.user;
  if (!user) return null;
  return getDashboardTypeFromRole(user.role);
};

/**
 * Check if user has a specific permission
 */
export const selectHasPermission = (permission: string) => (state: RootState) => {
  const user = state.auth.user;
  if (!user) return false;
  return user.permissions?.includes(permission) || false;
};

/**
 * Check if user is super admin
 */
export const selectIsSuperAdmin = (state: RootState) => {
  return state.auth.user?.role === UserRole.SUPER_ADMIN;
};
