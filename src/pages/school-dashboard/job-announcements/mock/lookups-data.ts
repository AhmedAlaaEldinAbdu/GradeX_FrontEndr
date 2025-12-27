/**
 * Mock Lookup Data
 * Provides mock data for countries, school stages, subjects, qualifications, etc.
 */

export const MOCK_COUNTRIES = [
  { id: 'country-sa', arabicName: 'المملكة العربية السعودية', englishName: 'Saudi Arabia' },
  { id: 'country-eg', arabicName: 'مصر', englishName: 'Egypt' },
  { id: 'country-jo', arabicName: 'الأردن', englishName: 'Jordan' },
  { id: 'country-uae', arabicName: 'الإمارات', englishName: 'UAE' },
  { id: 'country-kw', arabicName: 'الكويت', englishName: 'Kuwait' },
  { id: 'country-ma', arabicName: 'المغرب', englishName: 'Morocco' },
  { id: 'country-lb', arabicName: 'لبنان', englishName: 'Lebanon' },
];

export const MOCK_SCHOOL_STAGES = [
  {
    id: 'stage-kindergarten',
    nameAr: 'رياض الأطفال',
    nameEn: 'Kindergarten',
    nameAR: 'رياض الأطفال',
    nameEN: 'Kindergarten',
  },
  {
    id: 'stage-primary',
    nameAr: 'المرحلة الابتدائية',
    nameEn: 'Primary Stage',
    nameAR: 'المرحلة الابتدائية',
    nameEN: 'Primary Stage',
  },
  {
    id: 'stage-middle',
    nameAr: 'المرحلة المتوسطة',
    nameEn: 'Middle Stage',
    nameAR: 'المرحلة المتوسطة',
    nameEN: 'Middle Stage',
  },
  {
    id: 'stage-high',
    nameAr: 'المرحلة الثانوية',
    nameEn: 'High School',
    nameAR: 'المرحلة الثانوية',
    nameEN: 'High School',
  },
];

export const MOCK_SUBJECTS = [
  { id: 'subject-math', name: 'الرياضيات', nameEn: 'Mathematics' },
  { id: 'subject-science', name: 'العلوم', nameEn: 'Science' },
  { id: 'subject-english', name: 'اللغة الإنجليزية', nameEn: 'English' },
  { id: 'subject-arabic', name: 'اللغة العربية', nameEn: 'Arabic' },
  { id: 'subject-physics', name: 'الفيزياء', nameEn: 'Physics' },
  { id: 'subject-chemistry', name: 'الكيمياء', nameEn: 'Chemistry' },
  { id: 'subject-biology', name: 'الأحياء', nameEn: 'Biology' },
  { id: 'subject-history', name: 'التاريخ', nameEn: 'History' },
  { id: 'subject-geography', name: 'الجغرافيا', nameEn: 'Geography' },
  { id: 'subject-computer', name: 'الحاسب الآلي', nameEn: 'Computer Science' },
];

export const MOCK_QUALIFICATIONS = [
  { id: 'qual-bachelor', nameAr: 'بكالوريوس', nameEn: "Bachelor's Degree" },
  { id: 'qual-master', nameAr: 'ماجستير', nameEn: "Master's Degree" },
  { id: 'qual-phd', nameAr: 'دكتوراه', nameEn: 'PhD' },
  { id: 'qual-diploma', nameAr: 'دبلوم تربوي', nameEn: 'Teaching Diploma' },
];

export const MOCK_TEACHER_LEVELS = [
  { id: 'level-assistant', arabicName: 'معلم مساعد', englishName: 'Assistant Teacher' },
  { id: 'level-teacher', arabicName: 'معلم', englishName: 'Teacher' },
  { id: 'level-senior', arabicName: 'معلم أول', englishName: 'Senior Teacher' },
  { id: 'level-expert', arabicName: 'معلم خبير', englishName: 'Expert Teacher' },
];

export const MOCK_ADMINISTRATIVE_POSITIONS = [
  { id: 'admin-coordinator', arabicName: 'منسق', englishName: 'Coordinator' },
  { id: 'admin-supervisor', arabicName: 'مشرف', englishName: 'Supervisor' },
  { id: 'admin-head', arabicName: 'رئيس قسم', englishName: 'Department Head' },
  { id: 'admin-principal', arabicName: 'مدير مدرسة', englishName: 'Principal' },
];

export const MOCK_LANGUAGES = [
  { id: 'lang-ar', arabicName: 'العربية', englishName: 'Arabic' },
  { id: 'lang-en', arabicName: 'الإنجليزية', englishName: 'English' },
  { id: 'lang-fr', arabicName: 'الفرنسية', englishName: 'French' },
];

export const MOCK_LANGUAGE_LEVELS = [
  { id: 'level-basic', nameAr: 'مبتدئ', nameEn: 'Basic' },
  { id: 'level-intermediate', nameAr: 'متوسط', nameEn: 'Intermediate' },
  { id: 'level-advanced', nameAr: 'متقدم', nameEn: 'Advanced' },
  { id: 'level-fluent', nameAr: 'طلاقة', nameEn: 'Fluent' },
  { id: 'level-native', nameAr: 'لغة أم', nameEn: 'Native' },
];

export const MOCK_JOB_BENEFITS = [
  { id: 'benefit-health', nameAr: 'تأمين صحي', nameEn: 'Health Insurance' },
  { id: 'benefit-housing', nameAr: 'بدل سكن', nameEn: 'Housing Allowance' },
  { id: 'benefit-transport', nameAr: 'بدل نقل', nameEn: 'Transport Allowance' },
  { id: 'benefit-training', nameAr: 'تدريب مستمر', nameEn: 'Continuous Training' },
  { id: 'benefit-bonus', nameAr: 'مكافآت سنوية', nameEn: 'Annual Bonus' },
];
