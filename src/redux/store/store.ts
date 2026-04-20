import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import schoolsReducer from '../features/schools/schoolsSlice';
import lookupsReducer from '../features/lookups/lookupsSlice';
// import academicSystemsSlice from '../features/academic-system/academicSystemSlice';
import academicSystemsReducer from '../features/academic-system/academicSystemSlice';
import academicSubSystemsReducer from '../features/academic-subsystem/academicSubSystemSlice';
import educationalStagesReducer from '../features/educational-stages/educationalStagesSlice';
import rolesReducer from '../features/roles/rolesSlice';
import userManagementReducer from '../features/user-management/userManagementSlice';
import officialHolidaysReducer from '../features/official-holidays';
import classroomsReducer from '../features/classrooms/classroomsSlice';
import subjectsReducer from '../features/subjects/subjectsSlice';
import booksReducer from '../features/books/booksSlice';
import teachersReducer from '../features/teachers/teachersSlice';
import jobAdvertismentsReducer from '../features/job-advertisments/jobAdvertismentsSlice';
import interviewsReducer from '../features/interviews/interviewsSlice';
import teacherAttendanceReducer from '../features/teacher-attendance/teacherAttendanceSlice';
import applicationsJobAdvertisementsReducer from '../features/applications-job-advertisements/applicationsJobAdvertisementsSlice';
import monthlyCalendarReducer from '../features/monthly-calendar/monthlyCalendarSlice';
import lessonsReducer from '../features/lessons/lessonsSlice';
import academicCalendarReducer from '../features/academic-calendar/academicCalendarSlice';
import tuitionFeesReducer from '../features/tuition-fees/tuitionFeesSlice';
import customersReducer from '../features/customers/customersSlice';
import invoicesReducer from '../features/invoices/invoicesSlice';
import offersReducer from '../features/offers/offersSlice';
import studentsReducer from '../features/students/studentsSlice';
import studentApplicationsReducer from '../features/student-applications/studentApplicationsSlice';
import studentInterviewsReducer from '../features/student-interviews/studentInterviewsSlice';
import studentAttendanceReducer from '../features/student-attendance/studentAttendanceSlice';
import preparationsReducer from '../features/preparations/preparationsSlice';
import schoolTasksReducer from '../features/school-tasks/schoolTasksSlice';
import taskCorrectionsReducer from '../features/task-corrections/taskCorrectionsSlice';
import taskStudentsReducer from '../features/task-students/taskStudentsSlice';
import gradesReducer from '../features/grades/gradesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    schools: schoolsReducer,
    lookups: lookupsReducer,
    // academicSystems: academicSystemsSlice,
    academicSystems: academicSystemsReducer,
    academicSubSystems: academicSubSystemsReducer,
    educationalStages: educationalStagesReducer,
    roles: rolesReducer,
    userManagement: userManagementReducer,
    officialHolidays: officialHolidaysReducer,
    classrooms: classroomsReducer,
    subjects: subjectsReducer,
    books: booksReducer,
    teachers: teachersReducer,
    jobAdvertisments: jobAdvertismentsReducer,
    applicationsJobAdvertisements: applicationsJobAdvertisementsReducer,
    interviews: interviewsReducer,
    teacherAttendance: teacherAttendanceReducer,
    studentAttendance: studentAttendanceReducer,
    monthlyCalendar: monthlyCalendarReducer,
    lessons: lessonsReducer,
    academicCalendar: academicCalendarReducer,
    tuitionFees: tuitionFeesReducer,
    customers: customersReducer,
    invoices: invoicesReducer,
    offers: offersReducer,
    students: studentsReducer,
    studentApplications: studentApplicationsReducer,
    studentInterviews: studentInterviewsReducer,
    preparations: preparationsReducer,
    schoolTasks: schoolTasksReducer,
    taskCorrections: taskCorrectionsReducer,
    taskStudents: taskStudentsReducer,
    grades: gradesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
