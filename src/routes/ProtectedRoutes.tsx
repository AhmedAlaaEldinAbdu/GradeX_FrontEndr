import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '@gradex/redux/features/auth/authSelectors';
import { UserRole, type UserRoleType } from '@gradex/constants';

/**
 * Protected Routes Component
 * Restricts access based on authentication and user roles
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRoleType[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && userRole) {
    if (!allowedRoles.includes(userRole)) {
      const dashboardRedirects: Record<UserRoleType, string> = {
        [UserRole.SUPER_ADMIN]: '/super-admin/dashboard',
        [UserRole.SCHOOL_ADMIN]: '/school/dashboard',
      };

      return <Navigate to={dashboardRedirects[userRole] || '/'} replace />;
    }
  }
  return <>{children}</>;
};

export default ProtectedRoute;
