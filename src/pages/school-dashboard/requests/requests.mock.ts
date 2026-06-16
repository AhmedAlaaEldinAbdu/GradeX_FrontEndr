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
  RequestParticipant,
} from '@/services/api/requests/requests.types';
import {
  StudentRequestStatus,
  StudentRequestType,
  EarlyLeaveStatus,
  RequestParticipantRole,
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
    studentId: String(index + 1),
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

export const MOCK_GRADE_OPTIONS = [
  { value: '1', label: 'الصف الأول' },
  { value: '2', label: 'الصف الثاني' },
  { value: '3', label: 'الصف الثالث' },
];

export const MOCK_CLASSROOM_OPTIONS = [
  { value: '1', label: '1/2 ع' },
  { value: '2', label: '2/2 ع' },
  { value: '3', label: '3/2 ع' },
];

export interface MockStudentOption {
  id: string;
  name: string;
  avatarPath: string | null;
}

export interface MockClassroomGroup {
  id: string;
  name: string;
  students: MockStudentOption[];
}

const buildStudents = (classroomId: string): MockStudentOption[] =>
  ['علي محمد', 'أحمد حسن', 'محمود سامي', 'يوسف خالد', 'عمر طارق'].map((name, index) => ({
    id: `${classroomId}-${index + 1}`,
    name,
    avatarPath: null,
  }));

export const MOCK_CLASSROOM_GROUPS: MockClassroomGroup[] = [
  { id: '1', name: 'صف 1/2 ع', students: buildStudents('1') },
  { id: '2', name: 'صف 2/2 ع', students: buildStudents('2') },
  { id: '3', name: 'صف 3/2 ع', students: buildStudents('3') },
];

const PARTICIPANTS: Record<string, { role: RequestParticipantRole; id?: string }> = {
  المدرسة: { role: RequestParticipantRole.School },
  'أحمد معتز حسن': {
    role: RequestParticipantRole.Student,
    id: '9896e349-39b1-44ac-3071-08de93a9d827',
  },
  'أ/ أحمد معتز': {
    role: RequestParticipantRole.Teacher,
    id: '2f17ff30-cb54-4203-acfc-08de2d2e68e4',
  },
};

const resolveParticipant = (name: string) =>
  PARTICIPANTS[name] ?? { role: RequestParticipantRole.School };

const STUDENT_GROUP: RequestParticipant[] = Array.from({ length: 25 }, (_, index) => ({
  id: index === 0 ? '9896e349-39b1-44ac-3071-08de93a9d827' : `student-${String(index + 1)}`,
  name: index === 0 ? 'أحمد معتز حسن' : `طالب ${String(index + 1)}`,
  avatarPath: null,
  role: RequestParticipantRole.Student,
}));

const GROUP_RECIPIENT_REQUEST_IDS = ['3', '5'];

const BASE_MESSAGE_REQUESTS: StudentRequestDto[] = [
  {
    id: '1',
    senderName: 'أحمد معتز حسن',
    senderAvatarPath: null,
    recipientName: 'المدرسة',
    recipientAvatarPath: null,
    messageContent: 'محتوي الرسالة',
    studentName: 'أحمد حسن ابراهيم',
    educationalStage: 'الصف الأول الإعدادي',
    classrooms: ['1/1 أعدادي', '2/1 أعدادي'],
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
    studentName: 'أحمد حسن ابراهيم',
    educationalStage: 'الصف الأول الإعدادي',
    classrooms: ['1/1 أعدادي', '2/1 أعدادي'],
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
    studentName: 'أحمد حسن ابراهيم',
    educationalStage: 'الصف الأول الإعدادي',
    classrooms: ['1/1 أعدادي', '2/1 أعدادي'],
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
    studentName: 'أحمد حسن ابراهيم',
    educationalStage: 'الصف الأول الإعدادي',
    classrooms: ['1/1 أعدادي', '2/1 أعدادي'],
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
    studentName: 'أحمد حسن ابراهيم',
    educationalStage: 'الصف الأول الإعدادي',
    classrooms: ['1/1 أعدادي', '2/1 أعدادي'],
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
    studentName: 'أحمد حسن ابراهيم',
    educationalStage: 'الصف الأول الإعدادي',
    classrooms: ['1/1 أعدادي', '2/1 أعدادي'],
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
    studentName: 'أحمد حسن ابراهيم',
    educationalStage: 'الصف الأول الإعدادي',
    classrooms: ['1/1 أعدادي', '2/1 أعدادي'],
    status: StudentRequestStatus.Pending,
    type: StudentRequestType.Messages,
    created: '2026-06-07T12:00:00Z',
  },
];

export const MOCK_MESSAGE_REQUESTS: StudentRequestDto[] = BASE_MESSAGE_REQUESTS.map((request) => {
  const sender = resolveParticipant(request.senderName);
  const recipient = resolveParticipant(request.recipientName);
  const isGroupRecipient = GROUP_RECIPIENT_REQUEST_IDS.includes(request.id);
  return {
    ...request,
    senderRole: sender.role,
    senderId: sender.id,
    recipientName: isGroupRecipient ? STUDENT_GROUP[0].name : request.recipientName,
    recipientRole: recipient.role,
    recipientId: recipient.id,
    recipientParticipants: isGroupRecipient ? STUDENT_GROUP : undefined,
  };
});

const REMINDER_STATUSES = [
  StudentRequestStatus.Pending,
  StudentRequestStatus.Viewed,
  StudentRequestStatus.Pending,
  StudentRequestStatus.Pending,
  StudentRequestStatus.Viewed,
  StudentRequestStatus.Pending,
];

const REMINDER_RECIPIENTS = [
  'أحمد معتز حسن',
  'أحمد معتز حسن',
  'أحمد معتز حسن',
  'المدرسة',
  'المدرسة',
  'المدرسة',
];

export const MOCK_REMINDER_REQUESTS: StudentRequestDto[] = REMINDER_STATUSES.map(
  (status, index) => {
    const recipientName = REMINDER_RECIPIENTS[index];
    const recipient = resolveParticipant(recipientName);
    return {
      id: String(index + 1),
      senderName: 'المدرسة',
      senderAvatarPath: null,
      senderRole: RequestParticipantRole.School,
      recipientName,
      recipientAvatarPath: null,
      recipientRole: recipient.role,
      recipientId: recipient.id,
      messageContent: 'معاد دوا الطالب',
      studentName: 'أحمد معتز حسن',
      studentId: '9896e349-39b1-44ac-3071-08de93a9d827',
      educationalStage: 'المرحلة الأعدادية',
      classrooms: ['1/1 ع'],
      status,
      type: StudentRequestType.Reminder,
      created: '2020-01-01T00:00:00Z',
    };
  }
);
