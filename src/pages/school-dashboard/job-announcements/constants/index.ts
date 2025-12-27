export const JOB_APPLICANTS_TABS = {
  REQUESTS: 'requests',
  ARCHIVED: 'archived',
} as const;

export type JobApplicantsTab = (typeof JOB_APPLICANTS_TABS)[keyof typeof JOB_APPLICANTS_TABS];
