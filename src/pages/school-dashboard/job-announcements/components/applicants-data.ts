export const WORK_TYPE_BADGES: Record<number, { bg?: string; label: string }> = {
  1: {
    // bg: 'bg-blue-50 text-blue-700',
    label: 'jobAnnouncement.form.contractFullTime',
  },
  2: {
    // bg: 'bg-emerald-50 text-emerald-700',
    label: 'jobAnnouncement.form.contractPartTime',
  },
  3: {
    // bg: 'bg-violet-50 text-violet-700',
    label: 'jobAnnouncement.form.contractBoth',
  },
};

export const JOB_APPLICATION_STATUS = {
  ACCEPT: 1,
  REJECT: 2,
  PENDING: 3,
  DELETED: 4,
  ARCHIVED: 5,
  INTERVIEW_SCHEDULED: 6,
} as const;

export type JobApplicationStatus =
  (typeof JOB_APPLICATION_STATUS)[keyof typeof JOB_APPLICATION_STATUS];

