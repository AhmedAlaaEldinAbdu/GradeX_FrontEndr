import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  selectDashboardType,
  selectIsAuthenticated,
} from '@gradex/redux/features/auth/authSelectors';
import React from 'react';
import { UserRole } from '@gradex/constants';
import SuperAdminRouter from './SuperAdminRouter';
import SchoolRouter from './SchoolRouter';
import {
  LoginPage,
  VerifyOtpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  PasswordResetSuccessPage,
} from '@gradex/pages/auth';

/**
 * Role-Based Router
 * Dynamically renders routes based on user's dashboard type
 */
const RoleBasedRouter: React.FC = () => {
  const dashboardType = useSelector(selectDashboardType);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  console.log('🔀 RoleBasedRouter render:', {
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
      </Routes>
    );
  }

  // Super Admin Routes
  if (dashboardType === UserRole.SUPER_ADMIN) {
    return <SuperAdminRouter />;
  }

  // School Admin Routes
  if (dashboardType === UserRole.SCHOOL_ADMIN) {
    return <SchoolRouter />;
  }

  // Default fallback
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default RoleBasedRouter;
