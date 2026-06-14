/**
 * Temporary mock data for the Requests (الطلبات) feature.
 *
 * TODO(backend): remove this file and replace its usage with the redux slice +
 * `@/services/api/requests/requests.service` once the API is available.
 */
import type {
  StudentRequestDto,
  StudentRequestsStats,
  EarlyLeaveRequestDto,
} from '@/services/api/requests/requests.types';
import {
  StudentRequestStatus,
  StudentRequestType,
  EarlyLeaveStatus,
} from '@/services/api/requests/requests.types';

export const MOCK_REQUESTS_STATS: StudentRequestsStats = {
  pending: 12,
  acceptedPercentage: 96,
  rejected: 55,
  total: 87,
};

const EARLY_LEAVE_STATUSES = [
  EarlyLeaveStatus.Pending,
  EarlyLeaveStatus.Accepted,
  EarlyLeaveStatus.Pending,
  EarlyLeaveStatus.Pending,
  EarlyLeaveStatus.Accepted,
  EarlyLeaveStatus.Rejected,
];

export const MOCK_EARLY_LEAVE_REQUESTS: EarlyLeaveRequestDto[] = EARLY_LEAVE_STATUSES.map(
  (status, index) => ({
    id: String(index + 1),
    studentName: 'أحمد معتز حسن',
    studentAvatarPath: null,
    time: '2:00 مساءا',
    duration: 'ساعتين',
    date: '1/1/2020',
    stage: 'المرحلة الأعدادية',
    classroom: '1/1 ع',
    status,
  })
);

export const MOCK_MESSAGE_REQUESTS: StudentRequestDto[] = [
  {
    id: '1',
    senderName: 'أحمد معتز حسن',
    senderAvatarPath: null,
    recipientName: 'المدرسة',
    recipientAvatarPath: null,
    status: StudentRequestStatus.Replied,
    type: StudentRequestType.Messages,
    created: '2026-06-01T09:00:00Z',
  },
  {
    id: '2',
    senderName: 'المدرسة',
    senderAvatarPath: null,
    recipientName: 'أحمد معتز حسن',
    recipientAvatarPath: null,
    status: StudentRequestStatus.Sent,
    type: StudentRequestType.Messages,
    created: '2026-06-02T10:30:00Z',
  },
  {
    id: '3',
    senderName: 'المدرسة',
    senderAvatarPath: null,
    recipientName: 'أحمد معتز حسن',
    recipientAvatarPath: null,
    status: StudentRequestStatus.Sent,
    type: StudentRequestType.Messages,
    created: '2026-06-03T11:15:00Z',
  },
  {
    id: '4',
    senderName: 'أحمد معتز حسن',
    senderAvatarPath: null,
    recipientName: 'أ/ أحمد معتز',
    recipientAvatarPath: null,
    status: StudentRequestStatus.Viewed,
    type: StudentRequestType.Messages,
    created: '2026-06-04T08:45:00Z',
  },
  {
    id: '5',
    senderName: 'المدرسة',
    senderAvatarPath: null,
    recipientName: 'أحمد معتز حسن',
    recipientAvatarPath: null,
    status: StudentRequestStatus.Replied,
    type: StudentRequestType.Messages,
    created: '2026-06-05T14:20:00Z',
  },
  {
    id: '6',
    senderName: 'أحمد معتز حسن',
    senderAvatarPath: null,
    recipientName: 'المدرسة',
    recipientAvatarPath: null,
    status: StudentRequestStatus.Pending,
    type: StudentRequestType.Messages,
    created: '2026-06-06T16:10:00Z',
  },
  {
    id: '7',
    senderName: 'أحمد معتز حسن',
    senderAvatarPath: null,
    recipientName: 'أ/ أحمد معتز',
    recipientAvatarPath: null,
    status: StudentRequestStatus.Pending,
    type: StudentRequestType.Messages,
    created: '2026-06-07T12:00:00Z',
  },
];
