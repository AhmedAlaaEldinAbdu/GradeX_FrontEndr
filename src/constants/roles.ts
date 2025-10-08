/**
 * Centralized Role Constants
 * Single source of truth for all user roles in the application
 */

export const UserRole = {
  SUPER_ADMIN: 'super-admin',
  SCHOOL_ADMIN: 'school-admin',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * Role display names for UI
 */
export const RoleDisplayNames: Record<UserRoleType, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.SCHOOL_ADMIN]: 'School Admin',
};
