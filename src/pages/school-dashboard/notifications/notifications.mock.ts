export type Audience = 'drivers' | 'employees' | 'parents';

export interface NotificationItem {
  id: number;
  recipientName: string;
  subject: string;
  date: string;
  hasAttachment: boolean;
  educationalStage?: string;
  classrooms?: string[];
  viewerCount?: number;
}

type Translate = (key: string) => string;

export const getMockNotifications = (t: Translate): Record<Audience, NotificationItem[]> => ({
  drivers: [
    {
      id: 1,
      recipientName: t('notifications.mock.driverName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
    },
    {
      id: 2,
      recipientName: t('notifications.mock.driverName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: false,
      viewerCount: 8,
    },
    {
      id: 3,
      recipientName: t('notifications.mock.driverName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
    },
  ],
  employees: [
    {
      id: 1,
      recipientName: t('notifications.mock.employeeName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
    },
    {
      id: 2,
      recipientName: t('notifications.mock.employeeName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
    },
    {
      id: 3,
      recipientName: t('notifications.mock.employeeName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: false,
      viewerCount: 25,
    },
    {
      id: 4,
      recipientName: t('notifications.mock.employeeName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
    },
    {
      id: 5,
      recipientName: t('notifications.mock.employeeName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: false,
      viewerCount: 25,
    },
    {
      id: 6,
      recipientName: t('notifications.mock.employeeName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
    },
    {
      id: 7,
      recipientName: t('notifications.mock.employeeName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: false,
    },
  ],
  parents: [
    {
      id: 1,
      recipientName: t('notifications.mock.parentName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
      educationalStage: t('notifications.mock.primaryStage'),
      classrooms: [
        t('notifications.mock.classrooms.oneOne'),
        t('notifications.mock.classrooms.twoOne'),
        t('notifications.mock.classrooms.twoTwo'),
      ],
    },
    {
      id: 2,
      recipientName: t('notifications.mock.parentName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
      educationalStage: t('notifications.mock.secondaryStage'),
      classrooms: [t('notifications.mock.classrooms.twoOne')],
    },
    {
      id: 3,
      recipientName: t('notifications.mock.parentName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: false,
      educationalStage: t('notifications.mock.preparatoryStage'),
      classrooms: [t('notifications.mock.classrooms.oneOne')],
      viewerCount: 25,
    },
    {
      id: 4,
      recipientName: t('notifications.mock.parentName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
      educationalStage: t('notifications.mock.kindergartenStage'),
      classrooms: [t('notifications.mock.classrooms.oneOne')],
    },
    {
      id: 5,
      recipientName: t('notifications.mock.parentName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: false,
      educationalStage: t('notifications.mock.primaryStage'),
      classrooms: [t('notifications.mock.classrooms.oneThree')],
      viewerCount: 25,
    },
    {
      id: 6,
      recipientName: t('notifications.mock.parentName'),
      subject: t('notifications.mock.subject'),
      date: '22/2/2025',
      hasAttachment: true,
      educationalStage: t('notifications.mock.primaryStage'),
      classrooms: [t('notifications.mock.classrooms.oneOne')],
    },
  ],
});
