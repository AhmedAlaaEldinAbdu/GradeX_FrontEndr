import { BackendRole } from '@/constants/roles';
import type { SchoolPermissionSnapshot } from '@/constants/role-access';
import { logger } from '@/lib/utils/logger';
import type { User } from '@/redux/features/auth/authTypes';

const normalizeBackendRole = (role?: string): string =>
  String(role ?? '')
    .trim()
    .toLowerCase();

/**
 * Future backend permission integration point.
 *
 * When the endpoint is ready, implement the request and map its response to
 * `SchoolPermissionSnapshot` here. RoleAccessProvider already consumes this
 * function, so feature pages and shared controls do not need to change.
 */
export async function fetchSchoolPermissionSnapshot(
  user: User | null
): Promise<SchoolPermissionSnapshot | null> {
  if (normalizeBackendRole(user?.backendRole) !== BackendRole.SCHOOL_OWNER.toLowerCase() || !user) {
    return null;
  }

  try {
    void user;
    return null;
  } catch (error) {
    logger.warn('Unable to load backend school permissions; using the frontend matrix', {
      error,
      userId: user.id,
    });
    return null;
  }
}

export const roleAccessApiService = {
  fetchSchoolPermissionSnapshot,
};

export default roleAccessApiService;
