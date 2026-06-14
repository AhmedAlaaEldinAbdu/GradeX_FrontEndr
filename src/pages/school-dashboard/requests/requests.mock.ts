/**
 * Temporary mock data for the Requests (الطلبات) feature.
 *
 * TODO(backend): remove this file and replace its usage with the redux slice +
 * `@/services/api/requests/requests.service` once the API is available.
 */
import type {
  StudentRequestDto,
  StudentRequestsStats,
} from '@/services/api/requests/requests.types';
import { StudentRequestStatus, StudentRequestType } from '@/services/api/requests/requests.types';

export const MOCK_REQUESTS_STATS: StudentRequestsStats = {
  pending: 12,
  acceptedPercentage: 96,
  rejected: 55,
  total: 87,
};

export const MOCK_MESSAGE_REQUESTS: StudentRequestDto[] = [
  {
    id: '1',
    senderName: 'أحمد معتز حسن',
    senderAvatarPath: null,
    recipientName: 'المدرسة',
    recipientAvatarPath: null,
    messageContent: 'محتوي الرسالة',
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
    messageContent: 'محتوي الرسالة',
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
    messageContent: 'محتوي الرسالة',
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
    messageContent: 'محتوي الرسالة',
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
    messageContent: 'محتوي الرسالة',
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
    messageContent: 'محتوي الرسالة',
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
    messageContent: 'محتوي الرسالة',
    status: StudentRequestStatus.Pending,
    type: StudentRequestType.Messages,
    created: '2026-06-07T12:00:00Z',
  },
];
