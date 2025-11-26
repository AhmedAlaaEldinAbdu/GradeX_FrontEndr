import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@gradex/constants';
import ProtectedRoute from './ProtectedRoutes';
import MainLayout from '@gradex/shared/layout/MainLayout';

import StudentManagementPage from '@gradex/pages/student-management/student-management-page';
import GradesPage from '@gradex/pages/school-admin/grades/grades-page';
import AddGradePage from '@gradex/pages/school-admin/grades/add-grade-page';
import EditGradePage from '@gradex/pages/school-admin/grades/edit-grade-page';

const SchoolRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="flex h-full flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-gray-800">School Dashboard</h1>
                <h2 className="text-2xl font-bold text-gray-800">مرحباً بك في GradeX</h2>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <StudentManagementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/educational-stages"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">المراحل التعليمية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/grades"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <GradesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/grades/add-grade"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddGradePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/grades/edit-grade/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditGradePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الكتب الدراسية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching-staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
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
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
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
        path="/attendance-requests"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
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
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
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
        path="/fees"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الرسوم المالية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bus-management"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">إدارة الحافلات</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
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
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
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
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الإعدادات</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Redirect root to school dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Catch all - redirect to school dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default SchoolRouter;
