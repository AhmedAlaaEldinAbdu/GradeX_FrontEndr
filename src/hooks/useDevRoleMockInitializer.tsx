import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectUserRole } from '@gradex/redux/features/auth/authSelectors';
import { UserRole, type UserRoleType } from '@gradex/constants';
import { setUser, setUserRole } from '@gradex/redux/features/auth/authSlice';

export const useDevRoleMockInitializer = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);
  const currentRole = useSelector(selectUserRole);

  useEffect(() => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return;
    }
    // TODO(TEST TEAM): temporary dev role initializer for builds without backend.
    // Reads from localStorage `userData.role` (same contract used by token-manager).
    let savedRole: UserRoleType | null = null;
    try {
      const rawUserData = localStorage.getItem('userData');
      const parsed = rawUserData ? (JSON.parse(rawUserData) as { role?: unknown }) : null;
      const role = parsed?.role;
      if (role === UserRole.SUPER_ADMIN || role === UserRole.SCHOOL_ADMIN) {
        savedRole = role;
      }
    } catch {
      savedRole = null;
    }

    if (!currentUser) {
      dispatch(
        setUser({
          id: 1,
          name: 'Admin',
          email: 'admin@gradex.com',
          role: savedRole || UserRole.SUPER_ADMIN,
        })
      );
    } else if (savedRole && savedRole !== currentRole) {
      dispatch(setUserRole(savedRole));
    }
  }, [currentUser, currentRole, dispatch]);
};
