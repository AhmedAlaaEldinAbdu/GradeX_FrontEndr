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
    const savedRole = localStorage.getItem('dev_current_role') as UserRoleType | null;

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
