import { JobAdvertismentWorkShedule } from '@/services/api/types/job-advertisment.types';

export const WORK_TYPE_BADGES: Record<JobAdvertismentWorkShedule, { bg: string; label: string }> = {
  [JobAdvertismentWorkShedule.FULL_TIME]: {
    bg: 'bg-blue-50 text-blue-700',
    label: 'jobAnnouncement.form.contractFullTime',
  },
  [JobAdvertismentWorkShedule.PART_TIME]: {
    bg: 'bg-emerald-50 text-emerald-700',
    label: 'jobAnnouncement.form.contractPartTime',
  },
  [JobAdvertismentWorkShedule.BOTH]: {
    bg: 'bg-violet-50 text-violet-700',
    label: 'jobAnnouncement.form.contractBoth',
  },
};

export const STATUS_BADGES = {
  shortlisted: 'bg-blue-50 text-blue-700',
  interview: 'bg-amber-50 text-amber-700',
  hired: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-50 text-red-600',
} as const;

export const QUALIFICATION_LABELS = {
  bachelor: { ar: 'بكالوريوس تربية', en: 'B.Ed in Education' },
  master: { ar: 'ماجستير مناهج', en: 'M.Ed Curriculum' },
  diploma: { ar: 'دبلوم تربوي', en: 'PGCE Diploma' },
  leadership: { ar: 'شهادة قيادة تعليمية', en: 'Educational Leadership Cert.' },
} as const;

export const NATIONALITY_LABELS = {
  sa: { ar: 'سعودية', en: 'Saudi' },
  eg: { ar: 'مصرية', en: 'Egyptian' },
  jo: { ar: 'أردنية', en: 'Jordanian' },
  ma: { ar: 'مغربية', en: 'Moroccan' },
  lb: { ar: 'لبنانية', en: 'Lebanese' },
} as const;

export type QualificationKey = keyof typeof QUALIFICATION_LABELS;
export type NationalityKey = keyof typeof NATIONALITY_LABELS;
export type ApplicantStatus = keyof typeof STATUS_BADGES;

export type Applicant = {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  email: string;
  phone: string;
  resumeUrl: string;
  workType: JobAdvertismentWorkShedule;
  qualificationKey: QualificationKey;
  yearsExperience: number;
  nationalityKey: NationalityKey;
  countryKey: NationalityKey;
  addressAr: string;
  addressEn: string;
  status?: ApplicantStatus;
};

export const APPLICATION_REQUESTS: Applicant[] = [
  {
    id: 'app-1',
    nameAr: 'أريج المطيري',
    nameEn: 'Arej Almutairi',
    roleAr: 'معلمة رياضيات متقدمة',
    roleEn: 'Senior Math Teacher',
    email: 'arej.almutairi@example.com',
    phone: '+966501234567',
    resumeUrl: '#',
    workType: JobAdvertismentWorkShedule.FULL_TIME,
    qualificationKey: 'bachelor',
    yearsExperience: 6,
    nationalityKey: 'sa',
    countryKey: 'sa',
    addressAr: 'الرياض - حي الندى',
    addressEn: 'Riyadh - Al Nada',
    status: 'shortlisted',
  },
  {
    id: 'app-2',
    nameAr: 'لمياء حسن',
    nameEn: 'Lamia Hassan',
    roleAr: 'معلمة مناهج دولية',
    roleEn: 'IB Curriculum Teacher',
    email: 'lamia.hassan@example.com',
    phone: '+966555223344',
    resumeUrl: '#',
    workType: JobAdvertismentWorkShedule.PART_TIME,
    qualificationKey: 'master',
    yearsExperience: 8,
    nationalityKey: 'eg',
    countryKey: 'eg',
    addressAr: 'القاهرة - التجمع الخامس',
    addressEn: 'Cairo - New Cairo',
    status: 'interview',
  },
  {
    id: 'app-3',
    nameAr: 'ريما العبدالله',
    nameEn: 'Reema Alabdullah',
    roleAr: 'معلمة قدرات وموهبة',
    roleEn: 'Gifted Program Teacher',
    email: 'reema.abdullah@example.com',
    phone: '+966533210987',
    resumeUrl: '#',
    workType: JobAdvertismentWorkShedule.FULL_TIME,
    qualificationKey: 'diploma',
    yearsExperience: 5,
    nationalityKey: 'jo',
    countryKey: 'jo',
    addressAr: 'عمّان - عبدون',
    addressEn: 'Amman - Abdoun',
    status: 'shortlisted',
  },
  {
    id: 'app-4',
    nameAr: 'سارة بوهلال',
    nameEn: 'Sarah Bouhlal',
    roleAr: 'معلمة رياضيات متقدمة',
    roleEn: 'Advanced Math Instructor',
    email: 'sarah.bouhlal@example.com',
    phone: '+212611223344',
    resumeUrl: '#',
    workType: JobAdvertismentWorkShedule.PART_TIME,
    qualificationKey: 'leadership',
    yearsExperience: 10,
    nationalityKey: 'ma',
    countryKey: 'ma',
    addressAr: 'الدار البيضاء - أنفا',
    addressEn: 'Casablanca - Anfa',
    status: 'interview',
  },
  {
    id: 'app-5',
    nameAr: 'نور ياسين',
    nameEn: 'Noor Yassin',
    roleAr: 'منسقة مادة الرياضيات',
    roleEn: 'Math Department Coordinator',
    email: 'noor.yassin@example.com',
    phone: '+96170111222',
    resumeUrl: '#',
    workType: JobAdvertismentWorkShedule.FULL_TIME,
    qualificationKey: 'master',
    yearsExperience: 9,
    nationalityKey: 'lb',
    countryKey: 'lb',
    addressAr: 'بيروت - الحمرا',
    addressEn: 'Beirut - Hamra',
    status: 'shortlisted',
  },
];

export const ARCHIVED_APPLICATIONS: Applicant[] = [
  {
    id: 'arc-1',
    nameAr: 'ريم طلال',
    nameEn: 'Reem Talal',
    roleAr: 'مساعدة معلم',
    roleEn: 'Assistant Teacher',
    email: 'reem.talal@example.com',
    phone: '+966555998877',
    resumeUrl: '#',
    workType: JobAdvertismentWorkShedule.FULL_TIME,
    qualificationKey: 'bachelor',
    yearsExperience: 3,
    nationalityKey: 'sa',
    countryKey: 'sa',
    addressAr: 'الرياض - الياسمين',
    addressEn: 'Riyadh - Al Yasmin',
    status: 'archived',
  },
  {
    id: 'arc-2',
    nameAr: 'منار جابر',
    nameEn: 'Manar Jaber',
    roleAr: 'معلمة أونلاين',
    roleEn: 'Remote Math Tutor',
    email: 'manar.jaber@example.com',
    phone: '+962701234567',
    resumeUrl: '#',
    workType: JobAdvertismentWorkShedule.PART_TIME,
    qualificationKey: 'diploma',
    yearsExperience: 4,
    nationalityKey: 'jo',
    countryKey: 'jo',
    addressAr: 'إربد - شارع الجامعة',
    addressEn: 'Irbid - University St.',
    status: 'rejected',
  },
];

