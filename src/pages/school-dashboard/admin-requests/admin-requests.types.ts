/**
 * Local types for the Admin Requests (الطلبات الإدارية) feature.
 *
 * TODO(backend): move these to `@/services/api/admin-requests/*` and replace the
 * mock data once the API is available.
 */

// Aligned with the API `workShedule` values (see JobAdvertismentWorkShedule).
export const WorkType = {
  Both: 0,
  Full: 1,
  Part: 2,
} as const;

export type WorkType = (typeof WorkType)[keyof typeof WorkType];

export const JobApplicationStatus = {
  Active: 0,
  Accepted: 1,
  Archived: 2,
  InterviewScheduled: 3,
} as const;

export type JobApplicationStatus = (typeof JobApplicationStatus)[keyof typeof JobApplicationStatus];

export const InterviewType = {
  Online: 0,
  Onsite: 1,
} as const;

export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType];

export interface JobApplicationCourse {
  name: string;
  duration: string;
}

export interface JobApplicationExperience {
  /** e.g. "مدرس تاريخ – مدرسة النيل الدولية" */
  title: string;
  /** e.g. "2018 – 2024" */
  period: string;
}

export interface JobApplicationLanguage {
  name: string;
  level: string;
}

export interface JobApplicationAttachment {
  id: string;
  name: string;
  /** Human-readable size, e.g. "520 KB". */
  size: string;
  url: string | null;
}

export interface JobApplicationDto {
  id: string;
  /** اسم الإعلان */
  announcementName: string;
  /** اسم مقدم الطلب */
  applicantName: string;
  applicantAvatarPath: string | null;
  /** e.g. "مدرس تاريخ" — shown under the name on the details page */
  role: string;
  /** السيرة الذاتية */
  cvUrl: string | null;
  workType: WorkType;
  /** المؤهل الدراسي */
  qualification: string;
  /** سنوات الخبرة الوظيفيه */
  experienceYears: number;
  /** الدولة */
  country: string;
  /** الجنسية */
  nationality: string;
  /** العنوان */
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  status: JobApplicationStatus;

  // ── Details ──────────────────────────────────────────────
  /** الحالة الإجتماعية */
  maritalStatus: string;
  /** دولة الإقامة */
  residenceCountry: string;
  /** رقم الهوية */
  nationalId: string;
  /** تاريخ الميلاد */
  birthDate: string;
  /** نوع الهوية */
  idType: string;
  /** الجامعة */
  university: string;
  /** المادة */
  subject: string;
  /** سنة التخرج */
  graduationYear: string;
  courses: JobApplicationCourse[];
  previousExperiences: JobApplicationExperience[];
  languages: JobApplicationLanguage[];
  attachments: JobApplicationAttachment[];
}

export interface AdminRequestsStats {
  pending: number;
  acceptedPercentage: number;
  rejected: number;
  total: number;
}

export const AdminMessageStatus = {
  Pending: 0,
  Viewed: 1,
} as const;

export type AdminMessageStatus = (typeof AdminMessageStatus)[keyof typeof AdminMessageStatus];

export interface AdminMessageParty {
  name: string;
  avatarPath: string | null;
  profilePath: string | null;
  isSchool?: boolean;
}

export interface AdminMessageDto {
  id: string;
  sender: AdminMessageParty;
  recipient: AdminMessageParty;
  status: AdminMessageStatus;
  stage: string | null;
  classroom: string | null;
  sentDate: string;
  messageContent: string;
}
