import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@gradex/constants';
import ProtectedRoute from './ProtectedRoutes';
import MainLayout from '@gradex/shared/layout/MainLayout';

import StudentManagementPage from '@/pages/school-dashboard/student-management/student-management-page';
import StudentDetailsPage from '@/pages/school-dashboard/student-management/student-details-page';
import ClassroomsPage from '@/pages/school-dashboard/classrooms/classrooms-page';
import AddClassroomPage from '@/pages/school-dashboard/classrooms/add-classroom-page';
import EditClassroomPage from '@/pages/school-dashboard/classrooms/edit-classroom-page';
import SubjectsPage from '@/pages/school-dashboard/subjects/subjects-page';
import AddSubjectPage from '@/pages/school-dashboard/subjects/add-subject-page';
import EditSubjectPage from '@/pages/school-dashboard/subjects/edit-subject-page';
import BooksPage from '@/pages/school-dashboard/books/books-page';
import AddBookPage from '@/pages/school-dashboard/books/add-book-page';
import EditBookPage from '@/pages/school-dashboard/books/edit-book-page';
import TeachersPage from '@/pages/school-dashboard/teachers/teachers-page';
import TeacherDetailsPage from '@/pages/school-dashboard/teachers/teacher-details-page';
import InterviewsPage from '@/pages/school-dashboard/interviews/interviews-page';
import AttendancePage from '@/pages/school-dashboard/attendance/attendance-page';
import JobAnnouncementsPage from '@/pages/school-dashboard/job-announcements/job-announcements-page';

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
        path="/students/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <StudentDetailsPage />
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
        path="/classrooms"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ClassroomsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms/add-classroom"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddClassroomPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms/edit-classroom/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditClassroomPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <SubjectsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects/add"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddSubjectPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects/edit/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditSubjectPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/books"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <BooksPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/books/add"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddBookPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/books/edit/:gradeBookId/:bookId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditBookPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeachersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeacherDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-announcements"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <JobAnnouncementsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <InterviewsPage />
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
              <AttendancePage />
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
