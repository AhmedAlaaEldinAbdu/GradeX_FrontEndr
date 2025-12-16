export interface TeacherAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  size: string;
  url: string;
}

export interface TeacherQualification {
  id: string;
  university: string;
  degree: string;
  subject: string;
  graduationYear: string;
}

export interface TeacherTrainingCourse {
  id: string;
  courseName: string;
  duration: string;
}

export interface TeacherExperience {
  id: string;
  position: string;
  organization: string;
  period: string;
}

export interface TeacherLanguage {
  language: string;
  level: string;
}

export interface TeacherSkill {
  name: string;
  level: string;
}

export interface TeacherAttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkInTime: string | null;
  checkOutTime: string | null;
  earlyDeparture: string | null;
}

export interface TeacherEducationalStage {
  id: string;
  nameAr: string;
  nameEn: string;
  classrooms: {
    id: string;
    nameAr: string;
    nameEn: string;
  }[];
}

export interface TeacherDetails {
  id: string;
  fullName: string;
  pictureProfilePath: string | null;
  email: string;
  phoneNumber: string;
  countryCode: string;
  nationality: string;
  maritalStatus: string;
  country: string;
  dateOfBirth: string;
  idNumber: string;
  idType: string;
  address: string;
  yearsOfExperience: number;
  attachments: TeacherAttachment[];
  qualifications: TeacherQualification[];
  trainingCourses: TeacherTrainingCourse[];
  experiences: TeacherExperience[];
  languages: TeacherLanguage[];
  skills: TeacherSkill[];
  attendanceSummary: {
    totalPresent: number;
    totalLate: number;
    totalAbsent: number;
  };
  attendanceRecords: TeacherAttendanceRecord[];
  educationalStagesSummary: {
    totalStages: number;
    totalClassrooms: number;
    totalStudents: number;
    totalSubjects: number;
    totalBooks: number;
  };
  educationalStages: TeacherEducationalStage[];
}

export const mockTeacherDetails: TeacherDetails = {
  id: '1',
  fullName: 'أحمد معتز حسن',
  pictureProfilePath: null,
  email: 'Ahmed@gmail.com',
  phoneNumber: '10 1234 5678',
  countryCode: '+20',
  nationality: 'مصري',
  maritalStatus: 'أعزب',
  country: 'مصر',
  dateOfBirth: '14 مايو 1990',
  idNumber: '12343405446',
  idType: 'إقامة',
  address: 'القاهرة – مدينة نصر – شارع مصطفى النحاس – عمارة 12',
  yearsOfExperience: 7,
  attachments: [
    {
      id: '1',
      name: 'جواز السفر',
      type: 'pdf',
      size: '520 KB',
      url: '/uploads/passport.pdf',
    },
    {
      id: '2',
      name: 'السيرة الذاتية:أحمد معتز حسن',
      type: 'pdf',
      size: '520 KB',
      url: '/uploads/cv.pdf',
    },
    {
      id: '3',
      name: 'شهادة دورة علم طفل',
      type: 'pdf',
      size: '520 KB',
      url: '/uploads/certificate1.pdf',
    },
    {
      id: '4',
      name: 'شهادة التخرج',
      type: 'pdf',
      size: '520 KB',
      url: '/uploads/graduation.pdf',
    },
  ],
  qualifications: [
    {
      id: '1',
      university: 'جامعة القاهرة',
      degree: 'بكالوريوس تربية',
      subject: 'تاريخ',
      graduationYear: '2012',
    },
  ],
  trainingCourses: [
    {
      id: '1',
      courseName: 'دورة علم طفل',
      duration: 'يناير 2012 - أبريل 2012',
    },
  ],
  experiences: [
    {
      id: '1',
      position: 'مدرس تاريخ',
      organization: 'مدرسة النيل الدولية',
      period: '2018 - 2024',
    },
    {
      id: '2',
      position: 'مدرس مساعد',
      organization: 'مدرسة الأزهر',
      period: '2014 - 2018',
    },
  ],
  languages: [
    { language: 'اللغة العربية', level: 'اللغة الأم' },
    { language: 'الإنجليزية', level: 'متقدم' },
  ],
  skills: [
    { name: 'استخدام الحاسب', level: 'متوسط' },
    { name: 'Microsoft Office, Google Classroom, Zoom', level: '' },
  ],
  attendanceSummary: {
    totalPresent: 89,
    totalLate: 15,
    totalAbsent: 13,
  },
  attendanceRecords: [
    {
      id: '1',
      date: '22/2/2025',
      status: 'absent',
      checkInTime: null,
      checkOutTime: null,
      earlyDeparture: null,
    },
    {
      id: '2',
      date: '22/2/2025',
      status: 'present',
      checkInTime: '7:34 ص',
      checkOutTime: '3:30 م',
      earlyDeparture: null,
    },
    {
      id: '3',
      date: '22/2/2025',
      status: 'late',
      checkInTime: '8:30 ص (ساعة)',
      checkOutTime: '3:30 م',
      earlyDeparture: '2:45 م',
    },
    {
      id: '4',
      date: '22/2/2025',
      status: 'present',
      checkInTime: '7:34 ص',
      checkOutTime: '3:30 م',
      earlyDeparture: null,
    },
    {
      id: '5',
      date: '22/2/2025',
      status: 'present',
      checkInTime: '7:34 ص',
      checkOutTime: '3:30 م',
      earlyDeparture: null,
    },
    {
      id: '6',
      date: '22/2/2025',
      status: 'present',
      checkInTime: '7:34 ص',
      checkOutTime: '3:30 م',
      earlyDeparture: null,
    },
  ],
  educationalStagesSummary: {
    totalStages: 2,
    totalClassrooms: 15,
    totalStudents: 120,
    totalSubjects: 2,
    totalBooks: 4,
  },
  educationalStages: [
    {
      id: '1',
      nameAr: 'المرحلة الإبتدائية',
      nameEn: 'Primary',
      classrooms: [
        { id: '1', nameAr: '1/1 ابتدائي', nameEn: '1/1 Primary' },
        { id: '2', nameAr: '1/2 ابتدائي', nameEn: '1/2 Primary' },
        { id: '3', nameAr: '1/3 ابتدائي', nameEn: '1/3 Primary' },
        { id: '4', nameAr: '1/4 ابتدائي', nameEn: '1/4 Primary' },
        { id: '5', nameAr: '1/5 ابتدائي', nameEn: '1/5 Primary' },
        { id: '6', nameAr: '1/6 ابتدائي', nameEn: '1/6 Primary' },
        { id: '7', nameAr: '1/7 ابتدائي', nameEn: '1/7 Primary' },
        { id: '8', nameAr: '1/8 ابتدائي', nameEn: '1/8 Primary' },
      ],
    },
    {
      id: '2',
      nameAr: 'رياض أطفال',
      nameEn: 'Kindergarten',
      classrooms: [
        { id: '9', nameAr: 'kg1', nameEn: 'KG1' },
        { id: '10', nameAr: 'kg2', nameEn: 'KG2' },
      ],
    },
  ],
};
