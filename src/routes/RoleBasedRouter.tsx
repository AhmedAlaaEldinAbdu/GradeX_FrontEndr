import { useSelector } from 'react-redux';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  selectDashboardType,
  selectIsAuthenticated,
} from '@gradex/redux/features/auth/authSelectors';
import React from 'react';
import { UserRole } from '@gradex/constants';
import SuperAdminRouter from './SuperAdminRouter';
import SchoolRouter from './SchoolRouter';
import { logger } from '@/lib/utils/logger';
import {
  LoginPage,
  VerifyOtpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  PasswordResetSuccessPage,
  AuthCallbackPage,
} from '@gradex/pages/auth';
import AddSchoolPage from '@/pages/super-admin-dashboard/schools/add-school-page';
import MainContainer from '@/shared/layout/Container';

/**
 * Role-Based Router
 * Dynamically renders routes based on user's dashboard type
 */
const RoleBasedRouter: React.FC = () => {
  const dashboardType = useSelector(selectDashboardType);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  // SSO callback must be reachable from any auth state — the page itself
  // decrypts the access_token, persists the session, and then navigates away.
  if (location.pathname === '/auth/callback') {
    return <AuthCallbackPage />;
  }

  const isSuperAdminRole = (role: unknown): boolean => {
    const normalized = String(role ?? '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');

    // Handles: Super-Admin, SuperAdmin, super-admin, superAdmin, Super Admin
    return normalized === 'superadmin';
  };

  logger.debug('RoleBasedRouter render', {
    isAuthenticated,
    dashboardType,
  });

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/password-reset-success" element={<PasswordResetSuccessPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route
          path="/schools/add-school"
          element={
            <MainContainer>
              <AddSchoolPage showBreadcrumb={false} />
            </MainContainer>
          }
        />
      </Routes>
    );
  }

  // Super Admin Routes
  if (dashboardType === UserRole.SUPER_ADMIN || isSuperAdminRole(dashboardType)) {
    return <SuperAdminRouter />;
  }

  // Any non–Super Admin role should land on School routes
  return <SchoolRouter />;
};

export default RoleBasedRouter;
