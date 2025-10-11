import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@gradex/constants';
import ProtectedRoute from './ProtectedRoutes';
import MainLayout from '@gradex/shared/layout/MainLayout';

import SchoolsPage from '@gradex/pages/super-admin-dashboard/schools/schools-page';
import RolesPermissionsPage from '@gradex/pages/super-admin-dashboard/roles-permissions/roles-permissions-page';
import AddRolePage from '@gradex/pages/super-admin-dashboard/roles-permissions/add-role-page';
import EditRolePage from '@gradex/pages/super-admin-dashboard/roles-permissions/edit-role-page';
import SystemUsersPage from '@gradex/pages/super-admin-dashboard/system-users/system-users-page';
import AddUserPage from '@gradex/pages/super-admin-dashboard/system-users/add-user-page';
import EditUserPage from '@gradex/pages/super-admin-dashboard/system-users/edit-user-page';

const SuperAdminRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="flex h-full flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-800">Super-Admin Dashboard</h1>
                <h2 className="text-2xl font-bold text-gray-800">مرحباً بك في GradeX</h2>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/schools"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <SchoolsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-system"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">النظام الأكاديمي</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الكتب الدراسية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* roles-permissions */}
      <Route
        path="/super-admin/employees-administration/roles-permissions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <RolesPermissionsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/employees-administration/roles-permissions/add-role"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddRolePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/employees-administration/roles-permissions/edit-role/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <EditRolePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* system-users */}
      <Route
        path="/super-admin/employees-administration/system-users"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <SystemUsersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/employees-administration/system-users/add-user"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddUserPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/employees-administration/system-users/edit-user/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <EditUserPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching-staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الكادر التعليمي</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-calendar"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">التقويم الأكاديمي</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">إدارة الطلاب</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance-requests"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">طلبات الحضور</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الحضور والغياب</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الإشعارات</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">التقارير</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الإعدادات</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Redirect root to super admin dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Catch all - redirect to super admin dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default SuperAdminRouter;
