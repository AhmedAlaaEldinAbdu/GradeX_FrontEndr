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
  id?: string;
  name: string;
  providerName?: string;
  startDate?: string;
  endDate?: string;
  certificateImage?: string | null;
  duration: string;
}

export interface JobApplicationExperience {
  id?: string;
  /** e.g. "مدرس تاريخ – مدرسة النيل الدولية" */
  title: string;
  /** e.g. "2018 – 2024" */
  period: string;
  teacherLevelNameAr?: string;
  teacherLevelNameEn?: string;
  schoolName?: string;
  startDate?: string;
  endDate?: string;
  isPresent?: boolean;
  attachments?: Array<{ id: string; file: string }>;
}

export interface JobApplicationLanguage {
  id?: string;
  name: string;
  level: string;
  nameAr?: string;
  nameEn?: string;
  levelAr?: string;
  levelEn?: string;
}

export interface JobApplicationQualification {
  id: string;
  lkQualificationId?: string;
  qualificationNameAr?: string;
  qualificationNameEn?: string;
  countryUniversityId?: string;
  countryUniversityNameAr?: string;
  countryUniversityNameEn?: string;
  graduationYear?: number | string;
  lkUniversityId?: string;
  universityNameAr?: string;
  universityNameEn?: string;
  college?: string;
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
  applicationJobAdvertismentId?: string;
  jobAdvertismentId?: string;
  teacherId?: string;
  schoolBranchesId?: string;
  supervisorId?: string;
  /** اسم الإعلان */
  announcementName: string;
  /** اسم مقدم الطلب */
  applicantName: string;
  applicantAvatarPath: string | null;
  /** URL of the teacher profile picture (teacherPictureProfilePath) */
  teacherPictureProfilePath: string | null;
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
  qualifications: JobApplicationQualification[];
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

export interface ScheduledInterviewDto {
  id: string;
  applicationId: string;
  applicantName: string;
  applicantAvatarPath: string | null;
  interviewDate: string;
  interviewTime: string | null;
}

export const AdminMessageStatus = {
  Pending: 1,
  Sent: 2,
  Viewed: 3,
  Replied: 4,
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

export const AdminTeacherNoteStatus = {
  Pending: 1,
  Viewed: 2,
} as const;

export type AdminTeacherNoteStatus =
  (typeof AdminTeacherNoteStatus)[keyof typeof AdminTeacherNoteStatus];

export interface AdminTeacherNoteParty {
  name: string;
  avatarPath: string | null;
  profilePath: string | null;
  isSchool?: boolean;
}

export interface AdminTeacherNoteDto {
  id: string;
  sender: AdminTeacherNoteParty;
  recipient: AdminTeacherNoteParty;
  status: AdminTeacherNoteStatus;
  stage: string | null;
  classroom: string | null;
  sentDate: string;
  noteContent: string;
}
