import type { ScheduledInterviewDto } from '../admin-requests.types';

/**
 * Temporary local data for the scheduled-interviews tab.
 *
 * Keep this shaped like the tab view model so swapping it for API data does
 * not require changing the table component.
 */
export const MOCK_SCHEDULED_INTERVIEWS: ScheduledInterviewDto[] = [
  {
    id: 'interview-1',
    applicationId: 'application-1',
    applicantName: 'أحمد معتز حسن',
    applicantAvatarPath: null,
    interviewDate: '2020-01-01',
    interviewTime: '14:00',
  },
  {
    id: 'interview-2',
    applicationId: 'application-2',
    applicantName: 'أحمد معتز حسن',
    applicantAvatarPath: null,
    interviewDate: '2020-01-01',
    interviewTime: null,
  },
  {
    id: 'interview-3',
    applicationId: 'application-3',
    applicantName: 'أحمد معتز حسن',
    applicantAvatarPath: null,
    interviewDate: '2020-01-01',
    interviewTime: null,
  },
  {
    id: 'interview-4',
    applicationId: 'application-4',
    applicantName: 'أحمد معتز حسن',
    applicantAvatarPath: null,
    interviewDate: '2020-01-01',
    interviewTime: null,
  },
  {
    id: 'interview-5',
    applicationId: 'application-5',
    applicantName: 'أحمد معتز حسن',
    applicantAvatarPath: null,
    interviewDate: '2020-01-01',
    interviewTime: null,
  },
  {
    id: 'interview-6',
    applicationId: 'application-6',
    applicantName: 'أحمد معتز حسن',
    applicantAvatarPath: null,
    interviewDate: '2020-01-01',
    interviewTime: null,
  },
  {
    id: 'interview-7',
    applicationId: 'application-7',
    applicantName: 'سارة محمد علي',
    applicantAvatarPath: null,
    interviewDate: '2020-01-02',
    interviewTime: '10:30',
  },
];
