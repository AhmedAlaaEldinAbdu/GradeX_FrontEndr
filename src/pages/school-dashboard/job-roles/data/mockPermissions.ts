// Dummy permission data mirroring the design. Replace with API data on backend integration.

export interface MockPermission {
  id: string;
  name: string;
}

export interface MockPermissionGroup {
  id: string;
  name: string;
  permissions: MockPermission[];
}

export const MOCK_PERMISSION_GROUPS: MockPermissionGroup[] = [
  {
    id: 'dashboard',
    name: 'لوحة التحكم',
    permissions: [
      { id: 'dashboard.overview', name: 'إحصاءات عامة' },
      { id: 'dashboard.transport-maps', name: 'خرائط النقل' },
    ],
  },
  {
    id: 'academic-affairs',
    name: 'الشؤون الأكاديمية',
    permissions: [
      { id: 'academic.stages-grades', name: 'المراحل والصفوف' },
      { id: 'academic.subjects', name: 'المواد الدراسية' },
      { id: 'academic.books', name: 'الكتب الدراسية' },
      { id: 'academic.exam-results', name: 'نتائج الاختبارات' },
    ],
  },
  {
    id: 'lms',
    name: 'التعليم الإلكتروني (LMS)',
    permissions: [
      { id: 'lms.overview', name: 'نظرة عامة (LMS Overview)' },
      { id: 'lms.live', name: 'الحصص المباشرة (Live)' },
      { id: 'lms.online-exams', name: 'الاختبارات الإلكترونية' },
      { id: 'lms.training-courses', name: 'الدورات التدريبية' },
      { id: 'lms.question-bank', name: 'بنك الأسئلة' },
      { id: 'lms.assignments', name: 'الواجبات والمهام' },
      { id: 'lms.lesson-preparation', name: 'تحضير الدروس' },
    ],
  },
  {
    id: 'calendar',
    name: 'التقويم',
    permissions: [
      { id: 'calendar.academic', name: 'تقويم أكاديمي' },
      { id: 'calendar.monthly', name: 'تقويم شهري' },
      { id: 'calendar.yearly', name: 'تقويم سنوي' },
    ],
  },
  {
    id: 'student-management',
    name: 'إدارة الطلاب',
    permissions: [
      { id: 'students.record', name: 'سجل الطلاب' },
      { id: 'students.attendance', name: 'حضور وانصراف الطلاب' },
      { id: 'students.applications', name: 'طلبات التقديم' },
      { id: 'students.registration-announcement', name: 'إعلان التسجيل' },
      { id: 'students.interviews', name: 'المقابلات (طلاب)' },
    ],
  },
  {
    id: 'school-transport',
    name: 'النقل المدرسي',
    permissions: [
      { id: 'transport.overview', name: 'نظرة عامة' },
      { id: 'transport.buses-routes', name: 'الحافلات والمسارات' },
      { id: 'transport.drivers', name: 'السائقين' },
    ],
  },
  {
    id: 'staff',
    name: 'الكادر التوظيفي',
    permissions: [
      { id: 'staff.employees', name: 'الموظفين' },
      { id: 'staff.job-announcements', name: 'إعلانات توظيف' },
      { id: 'staff.interviews', name: 'المقابلات (موظفين)' },
    ],
  },
  {
    id: 'financial-management',
    name: 'الإدارة المالية',
    permissions: [
      { id: 'finance.transactions', name: 'المعاملات المالية' },
      { id: 'finance.tuition-fees', name: 'الرسوم الدراسية' },
      { id: 'finance.invoices', name: 'الفواتير' },
      { id: 'finance.customers', name: 'العملاء' },
      { id: 'finance.contracts', name: 'العقود' },
    ],
  },
  {
    id: 'settings',
    name: 'الإعدادات',
    permissions: [
      { id: 'settings.school-data', name: 'بيانات المدرسة' },
      { id: 'settings.job-roles', name: 'الأدوار الوظيفية' },
      { id: 'settings.payment-channels', name: 'قنوات الدفع' },
      { id: 'settings.holidays', name: 'إعدادات الإجازات' },
      { id: 'settings.site', name: 'إعدادات الموقع' },
    ],
  },
];

export type PermissionAccess = 'view' | 'edit';

export interface SelectedPermission {
  access: PermissionAccess;
}

export type SelectedPermissionsMap = Record<string, SelectedPermission>;
