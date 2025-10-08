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

/**
 * Role-Based Router
 * Dynamically renders routes based on user's dashboard type
 */
const RoleBasedRouter: React.FC = () => {
  const dashboardType = useSelector(selectDashboardType);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <div className="py-16 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Login Page</h2>
            </div>
          }
        />
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
