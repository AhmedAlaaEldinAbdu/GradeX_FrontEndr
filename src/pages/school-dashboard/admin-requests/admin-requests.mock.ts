/**
 * Temporary mock data for the Admin Requests (الطلبات الإدارية) feature.
 *
 * TODO(backend): remove this file and wire the tabs to the admin-requests API/slice
 * once it is available.
 */
import {
  WorkType,
  JobApplicationStatus,
  type AdminRequestsStats,
  type JobApplicationDto,
} from './admin-requests.types';

export const MOCK_ADMIN_REQUESTS_STATS: AdminRequestsStats = {
  pending: 12,
  acceptedPercentage: 96,
  rejected: 55,
  total: 87,
};

const ADDRESSES = [
  'الرياض شارع المهدي',
  'حي غرب العجمي العنوفيل',
  'الخبر شارع عبدالله عزيز',
  'حي شرق العصافرة',
  'حي شرق ميامي',
  'الرياض شارع المهدي',
];

const COUNTRIES = ['السعودية', 'مصر', 'السعودية', 'مصر', 'مصر', 'السعودية'];
const NATIONALITIES = ['سعودي', 'مصري', 'سعودي', 'مصري', 'مصري', 'سعودي'];
const EXPERIENCE_YEARS = [2, 3, 2, 3, 2, 2];
const WORK_TYPES = [
  WorkType.Full,
  WorkType.Full,
  WorkType.Full,
  WorkType.Part,
  WorkType.Part,
  WorkType.Part,
];

export const MOCK_JOB_APPLICATIONS: JobApplicationDto[] = Array.from({ length: 6 }, (_, index) => ({
  id: String(index + 1),
  announcementName: 'بكالوريوس تربية',
  applicantName: 'أحمد معتز حسن',
  applicantAvatarPath: null,
  role: 'مدرس تاريخ',
  cvUrl: null,
  workType: WORK_TYPES[index],
  qualification: 'بكالوريوس تربية',
  experienceYears: EXPERIENCE_YEARS[index],
  country: COUNTRIES[index],
  nationality: NATIONALITIES[index],
  address: ADDRESSES[index],
  email: 'Ahmed@gmail.com',
  phone: '+20 10 1234 5678',
  whatsapp: '+20 10 1234 5678',
  status: JobApplicationStatus.Active,

  maritalStatus: 'أعزب',
  residenceCountry: 'مصر',
  nationalId: '12343405446',
  birthDate: '14 مايو 1990',
  idType: 'إقامة',
  university: 'جامعة القاهرة',
  subject: 'تاريخ',
  graduationYear: '2012',
  courses: [{ name: 'دورة علم طفل', duration: 'يناير 2012 - أبريل 2012' }],
  previousExperiences: [
    { title: 'مدرس تاريخ – مدرسة النيل الدولية', period: '2018 – 2024' },
    { title: 'مدرس مساعد – مدرسة الأزهار', period: '2014 – 2018' },
  ],
  languages: [
    { name: 'اللغة العربية', level: 'اللغة الأم' },
    { name: 'الإنجليزي', level: 'متقدّم' },
  ],
  attachments: [
    { id: 'cv', name: 'السيرة الذاتية.أحمد معتز حسن', size: '520 KB', url: null },
    { id: 'passport', name: 'جواز السفر', size: '520 KB', url: null },
    { id: 'graduation', name: 'شهادة التخرج', size: '520 KB', url: null },
    { id: 'course', name: 'شهادة دورة علم طفل', size: '520 KB', url: null },
  ],
}));

export const findJobApplicationById = (id: string): JobApplicationDto | undefined =>
  MOCK_JOB_APPLICATIONS.find((application) => application.id === id);
