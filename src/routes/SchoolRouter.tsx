import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@gradex/constants';
import ProtectedRoute from './ProtectedRoutes';
import MainLayout from '@gradex/shared/layout/MainLayout';

import DashboardPage from '@/pages/school-dashboard/dashboard/dashboard-page';
import ELearningOverviewPage from '@/pages/school-dashboard/e-learning/e-learning-overview-page';
import OnlineExamsPage from '@/pages/school-dashboard/e-learning/online-exams-page';
import AddAIExamPage from '@/pages/school-dashboard/e-learning/add-ai-exam-page';
import AddQuestionBankExamPage from '@/pages/school-dashboard/e-learning/add-question-bank-exam-page';
import ExamDetailsPage from '@/pages/school-dashboard/e-learning/exam-details-page';
import ExamReviewPage from '@/pages/school-dashboard/e-learning/exam-review-page';
import TrainingCoursesPage from '@/pages/school-dashboard/e-learning/training-courses-page';
import AddTrainingCoursePage from '@/pages/school-dashboard/e-learning/add-training-course-page';
import EditTrainingCoursePage from '@/pages/school-dashboard/e-learning/edit-training-course-page';
import CourseDetailsPage from '@/pages/school-dashboard/e-learning/course-details-page';
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
import JobRolesPage from '@/pages/school-dashboard/preparations/job-roles-page';
import AddJobRolePage from '@/pages/school-dashboard/job-roles/add-job-role-page';
import EditJobRolePage from '@/pages/school-dashboard/job-roles/edit-job-role-page';
import AddSystemUserPage from '@/pages/school-dashboard/job-roles/add-system-user-page';
import EditSystemUserPage from '@/pages/school-dashboard/job-roles/edit-system-user-page';
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
import StudentApplicationDetailsPage from '@/pages/school-dashboard/requests/student-application-details-page';
import PreparationsPage from '@/pages/school-dashboard/preparations/preparations-page';
import AddPreparationPage from '@/pages/school-dashboard/preparations/add-preparation-page';
import EditPreparationPage from '@/pages/school-dashboard/preparations/edit-preparation-page';
import TransactionsPage from '@/pages/school-dashboard/transactions/transactions-page';
import InvoicesPage from '@/pages/school-dashboard/invoices/invoices-page';
import InvoiceDetailsPage from '@/pages/school-dashboard/invoices/invoice-details-page';
import IssueInvoicePage from '@/pages/school-dashboard/invoices/issue-invoice-page';
import CustomersPage from '@/pages/school-dashboard/customers/customers-page';
import AddCustomerPage from '@/pages/school-dashboard/customers/add-customer-page';
import EditCustomerPage from '@/pages/school-dashboard/customers/edit-customer-page';
import CustomerDetailsPage from '@/pages/school-dashboard/customers/customer-details-page';
import RequestsPage from '@/pages/school-dashboard/requests/requests-page';
import ViewMessagePage from '@/pages/school-dashboard/requests/view-message-page';
import AddMessagePage from '@/pages/school-dashboard/requests/add-message-page';
import AdminRequestsPage from '@/pages/school-dashboard/admin-requests/admin-requests-page';
import JobApplicationDetailsPage from '@/pages/school-dashboard/admin-requests/job-application-details-page';
import SchoolNotificationsPage from '@/pages/school-dashboard/notifications/notifications-page';
import AddEmployeesNotificationPage from '@/pages/school-dashboard/notifications/add-employees-notification-page';
import AddParentsNotificationPage from '@/pages/school-dashboard/notifications/add-parents-notification-page';

const SchoolRouter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <DashboardPage />
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
        path="/students/student-details/:id"
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.examResults')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">
                  {t('sidebar.educationalStages')}
                </h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
        path="/requests/student-applications-details/:id"
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.buses')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.drivers')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.notifications')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.reports')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.settings')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.studio')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.schoolData')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
              <JobRolesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/job-roles/add-role"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddJobRolePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/job-roles/edit-role/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditJobRolePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/job-roles/add-user"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddSystemUserPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/job-roles/edit-user/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditSystemUserPage />
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.paymentChannels')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">
                  {t('sidebar.holidaysSettings')}
                </h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.siteSettings')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
              <SchoolNotificationsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications/employees/add"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddEmployeesNotificationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/notifications/parents/add"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddParentsNotificationPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/overview"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ELearningOverviewPage />
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.liveClasses')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
              <OnlineExamsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/online-exams/create/ai"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddAIExamPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/online-exams/create/question-bank"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddQuestionBankExamPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/online-exams/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ExamDetailsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/online-exams/:id/review/:studentId"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ExamReviewPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/courses"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <TrainingCoursesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/courses/add"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddTrainingCoursePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/courses/:id/edit"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <EditTrainingCoursePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms/courses/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <CourseDetailsPage />
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
                <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.questionBank')}</h2>
                <p className="mt-4 text-gray-600">{t('common.noAccessPermission')}</p>
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
              <RequestsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/add-message"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AddMessagePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/view-message/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <ViewMessagePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-requests"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <AdminRequestsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-requests/job-application/:id"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SCHOOL_ADMIN]}>
            <MainLayout>
              <JobApplicationDetailsPage />
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
