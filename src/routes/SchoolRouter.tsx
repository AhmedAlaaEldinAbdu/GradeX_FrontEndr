import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@gradex/constants';
import ProtectedRoute from './ProtectedRoutes';
import MainLayout from '@gradex/shared/layout/MainLayout';

import StudentManagementPage from '@/pages/school-dashboard/student-management/student-management-page';
import StudentDetailsPage from '@/pages/school-dashboard/student-management/student-details-page';
import StudentInterviewsPage from '@/pages/school-dashboard/student-interviews/student-interviews-page';
import ClassroomsPage from '@/pages/school-dashboard/classrooms/classrooms-page';
import ClassroomDetailsPage from '../pages/school-dashboard/classrooms/classroom-details-page';
import ClassroomRosterPage from '@/pages/school-dashboard/classrooms/classroom-roster-page';
import AddClassroomPage from '@/pages/school-dashboard/classrooms/add-classroom-page';
import EditClassroomPage from '@/pages/school-dashboard/classrooms/edit-classroom-page';
import SubjectsPage from '@/pages/school-dashboard/subjects/subjects-page';
import AddSubjectPage from '@/pages/school-dashboard/subjects/add-subject-page';
import EditSubjectPage from '@/pages/school-dashboard/subjects/edit-subject-page';
import BooksPage from '@/pages/school-dashboard/books/books-page';
import AddBookPage from '@/pages/school-dashboard/books/add-book-page';
import EditBookPage from '@/pages/school-dashboard/books/edit-book-page';
import TeacherDetailsPage from '@/pages/school-dashboard/teachers/teacher-details-page';
import TeacherPlacementPage from '@/pages/school-dashboard/teachers/teacher-placement-page';
import TeacherEditPlacementPage from '@/pages/school-dashboard/teachers/teacher-edit-placement-page';
import TeacherLeaveDetailsPage from '@/pages/school-dashboard/teachers/teacher-leave-details-page';
import TeachingStaffPage from '@/pages/school-dashboard/teaching-staff/TeachingStaffPage';
import InterviewsPage from '@/pages/school-dashboard/interviews/interviews-page';
import AttendancePage from '@/pages/school-dashboard/attendance/attendance-page';
import StudentsAttendancePage from '@/pages/school-dashboard/attendance/students-attendance-page';
import EmployeesAttendancePage from '@/pages/school-dashboard/attendance/employees-attendance-page';
import JobAnnouncementsPage from '@/pages/school-dashboard/job-announcements/job-announcements-page';
import AddJobAnnouncementsPage from '@/pages/school-dashboard/job-announcements/add-job-announcements-page';
import EditJobAnnouncementPage from '@/pages/school-dashboard/job-announcements/edit-job-announcement-page';
import JobAnnouncementDetailsPage from '@/pages/school-dashboard/job-announcements/job-announcement-details';
import RegistrationAnnouncementPage from '@/pages/school-dashboard/registration-announcement/registration-announcement-page';
import AddRegistrationAnnouncementPage from '@/pages/school-dashboard/registration-announcement/add-registration-announcement-page';
import EditRegistrationAnnouncementPage from '@/pages/school-dashboard/registration-announcement/edit-registration-announcement-page';
import WeeklyCalendarPage from '@/pages/school-dashboard/calendar-management/weekly-calendar-page';
import AddLessonPage from '@/pages/school-dashboard/calendar-management/add-lesson-page';
import AddTaskCorrectionPage from '@/pages/school-dashboard/calendar-management/add-task-correction-page';
import EditLessonPage from '@/pages/school-dashboard/calendar-management/edit-lesson-page';
import MonthlyCalendarPage from '@/pages/school-dashboard/calendar-management/monthly-calendar-page';
import AcademicCalendarPage from '@/pages/school-dashboard/calendar-management/academic-calendar-page';
import TasksPage from '@/pages/school-dashboard/calendar-management/tasks-page';
import AddTaskPage from '@/pages/school-dashboard/calendar-management/add-task-page';
import EditTaskPage from '@/pages/school-dashboard/calendar-management/edit-task-page';
import EditTaskCorrectionPage from '@/pages/school-dashboard/calendar-management/edit-task-correction-page';
import TaskDetailsPage from '@/pages/school-dashboard/calendar-management/task-details-page';
import TaskCorrectionPreviewPage from '@/pages/school-dashboard/calendar-management/task-correction-preview-page';
import AddAcademicCalendarPage from '@/pages/school-dashboard/calendar-management/add-academic-calendar-page';
import EditAcademicCalendarPage from '@/pages/school-dashboard/calendar-management/edit-academic-calendar-page';
import TuitionFeesPage from '@/pages/school-dashboard/tuition-fees/tuition-fees-page';
import AddTuitionFeePage from '@/pages/school-dashboard/tuition-fees/add-tuition-fee-page';
import ContractsPage from '@/pages/school-dashboard/contracts/contracts-page';
import AddContractPage from '@/pages/school-dashboard/contracts/add-contract-page';
import EditContractPage from '@/pages/school-dashboard/contracts/edit-contract-page';
import EditTuitionFeePage from '@/pages/school-dashboard/tuition-fees/edit-tuition-fee-page';
import AddDiscountOfferPage from '@/pages/school-dashboard/tuition-fees/add-discount-offer-page';
import EditDiscountOfferPage from '@/pages/school-dashboard/tuition-fees/edit-discount-offer-page';
import StudentApplicationsPage from '@/pages/school-dashboard/student-applications/student-applications-page';
import StudentApplicationDetailsPage from '@/pages/school-dashboard/student-applications/student-application-details-page';
import PreparationsPage from '@/pages/school-dashboard/preparations/preparations-page';
import AddPreparationPage from '@/pages/school-dashboard/preparations/add-preparation-page';
import EditPreparationPage from '@/pages/school-dashboard/preparations/edit-preparation-page';
import TransactionsPage from '@/pages/school-dashboard/transactions/TransactionsPage';
import InvoicesPage from '@/pages/school-dashboard/invoices/InvoicesPage';
import InvoiceDetailsPage from '@/pages/school-dashboard/invoices/InvoiceDetailsPage';
import IssueInvoicePage from '@/pages/school-dashboard/invoices/issue-invoice-page';
import CustomersPage from '@/pages/school-dashboard/customers/CustomersPage';
import AddCustomerPage from '@/pages/school-dashboard/customers/add-customer-page';
import EditCustomerPage from '@/pages/school-dashboard/customers/edit-customer-page';
import CustomerDetailsPage from '@/pages/school-dashboard/customers/customer-details-page';

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
        path="/students-record"
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
        path="/student-interviews"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <StudentInterviewsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration-announcement"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <RegistrationAnnouncementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration-announcement/add-registration-announcement"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddRegistrationAnnouncementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/registration-announcement/edit-registration-announcement/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditRegistrationAnnouncementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam-results"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">نتائج الاختبارات</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
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
        path="/classrooms/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ClassroomDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrooms/:id/roster"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ClassroomRosterPage />
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
      <Route path="/teachers" element={<Navigate to="/teaching-staff?tab=teachers" replace />} />
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
        path="/teaching-staff/teachers/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeacherDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/attendance/teachers/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeacherDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id/add-placement"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeacherPlacementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id/placement-details"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeacherPlacementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching-staff/teachers/:id/edit-placement/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeacherEditPlacementPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching-staff/teachers/:id/leaves/:leaveType"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeacherLeaveDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teaching-staff"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TeachingStaffPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/administrators"
        element={<Navigate to="/teaching-staff?tab=administrators" replace />}
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
        path="/job-announcements/:jobId/applicants"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <JobAnnouncementDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-announcements/add-job-announcements"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddJobAnnouncementsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-announcements/edit-job-announcement/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditJobAnnouncementPage />
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
        path="/calendar/tasks"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TasksPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/tasks/add-task"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddTaskPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/tasks/edit/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditTaskPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/tasks/details/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TaskDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/tasks/details/:id/correction/:submissionId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddTaskCorrectionPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/tasks/details/:id/edit-correction/:submissionId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditTaskCorrectionPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/tasks/details/:id/correction-preview/:submissionId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TaskCorrectionPreviewPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/preparations"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <PreparationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/preparations/add-preparation"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddPreparationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/preparations/edit-preparation/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditPreparationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/weekly"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <WeeklyCalendarPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/weekly/add-lesson"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddLessonPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/weekly/edit-lesson/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditLessonPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/monthly"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <MonthlyCalendarPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/academic"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AcademicCalendarPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/academic/add-academic-calendar"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddAcademicCalendarPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar/academic/edit-academic-calendar/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditAcademicCalendarPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-applications"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <StudentApplicationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-applications/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <StudentApplicationDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/attendance"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <StudentsAttendancePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/attendance"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EmployeesAttendancePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      {/* Legacy tabbed page kept for backward-compat with deep links */}
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
        path="/financial-management/fees"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TuitionFeesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/fees/add-tuition-fee"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddTuitionFeePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/fees/edit-tuition-fee/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditTuitionFeePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/fees/add-discount-offer"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddDiscountOfferPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/fees/edit-discount-offer/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditDiscountOfferPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/transactions"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TransactionsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/invoices"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <InvoicesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/invoices/issue"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <IssueInvoicePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/invoices/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <InvoiceDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/customers"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <CustomersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/customers/add-client"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddCustomerPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/customers/edit-client/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditCustomerPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/customers/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <CustomerDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bus-management/bus"
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
        path="/bus-management/drivers"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">السائقين</h2>
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
      <Route
        path="/studio"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الاستوديو</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/school-data"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">بيانات المدرسة</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/job-roles"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الأدوار الوظيفية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/payment-channels"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">قنوات الدفع</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/holidays"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">إعدادات الإجازات</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/site"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">إعدادات الموقع</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications"
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
        path="/lms/overview"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">نظرة عامة</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/live-classes"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الحصص المباشرة</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/online-exams"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الأختبارات الإلكترونية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/courses"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الدورات التدريبية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/question-bank"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">بنك الأسئلة</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الطلبات</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-requests"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <div className="py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800">الطلبات الإدارية</h2>
                <p className="mt-4 text-gray-600">قريباً...</p>
              </div>
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/contracts"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ContractsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/contracts/add-contract"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddContractPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-management/contracts/edit-contract"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditContractPage />
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
