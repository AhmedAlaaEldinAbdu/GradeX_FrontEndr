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
import AddSchoolPage from '@gradex/pages/super-admin-dashboard/schools/add-school-page';
import EditSchoolPage from '@gradex/pages/super-admin-dashboard/schools/edit-school-page';
import ViewSchoolPage from '@gradex/pages/super-admin-dashboard/schools/view-school-page';
import PendingSchoolDetailsPage from '@gradex/pages/super-admin-dashboard/schools/pending-school-details-page';
import RejectedSchoolDetailsPage from '@gradex/pages/super-admin-dashboard/schools/rejected-school-details-page';
import AcademicSystemPage from '@gradex/pages/super-admin-dashboard/academic-system/academic-system-page';
import AddAcademicSystemPage from '@/pages/super-admin-dashboard/academic-system/add-academic-system-page';
import EditAcademicSystemPage from '@/pages/super-admin-dashboard/academic-system/edit-academic-system-page';
import AddEducationalStagesPage from '@/pages/super-admin-dashboard/academic-system/add-educational-stages-page';
import EditEducationalStagesPage from '@/pages/super-admin-dashboard/academic-system/edit-educational-stages-page';
import NotificationsPage from '@gradex/pages/super-admin-dashboard/notifications/notifications-page';
import AddNotificationPage from '@gradex/pages/super-admin-dashboard/notifications/add-notification-page';
import EditNotificationPage from '@gradex/pages/super-admin-dashboard/notifications/edit-notification-page';
import OfficialHolidaysPage from './../pages/super-admin-dashboard/official-holidays/official-holidays-page';
import CountryHolidaysPage from './../pages/super-admin-dashboard/official-holidays/country-holidays-page';

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
        path="/schools"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <SchoolsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schools/add-school"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddSchoolPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schools/edit-school/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <EditSchoolPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schools/view-school/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <ViewSchoolPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schools/pending/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <PendingSchoolDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schools/rejected/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <RejectedSchoolDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* academic-system */}
      <Route
        path="/academic-system"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AcademicSystemPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-system/add-academic-system"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddAcademicSystemPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-system/edit-academic-system/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <EditAcademicSystemPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-system/add-educational-stages"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddEducationalStagesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-system/edit-educational-stages/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <EditEducationalStagesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/*  */}
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
        path="/employees-administration/roles-permissions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <RolesPermissionsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees-administration/roles-permissions/add-role"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddRolePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees-administration/roles-permissions/edit-role/:id"
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
        path="/employees-administration/system-users"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <SystemUsersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees-administration/system-users/add-user"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddUserPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees-administration/system-users/edit-user/:id"
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
        path="/official-holidays"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <OfficialHolidaysPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/official-holidays/country/:countryId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <CountryHolidaysPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <NotificationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/add-notification"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <AddNotificationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications/edit-notification/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <MainLayout>
              <EditNotificationPage />
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
