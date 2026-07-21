export type LiveClassStatus = 'completed' | 'active' | 'upcoming' | 'closed';

export type LiveClassRow = {
  id: string;
  subject: string;
  teacherName: string;
  status: LiveClassStatus;
  stage: string;
  classroom: string;
  date: string;
  startsAt: string;
  endsAt: string;
};

export const LIVE_CLASSES: LiveClassRow[] = [
  {
    id: '1',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'completed',
    stage: 'المرحلة الأبتدائية',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '2',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'completed',
    stage: 'المرحلة الثانوية',
    classroom: '2/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '3',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'active',
    stage: 'المرحلة الإعدادية',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '4',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'upcoming',
    stage: 'رياض الأطفال',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '5',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'upcoming',
    stage: 'المرحلة الأبتدائية',
    classroom: '3/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '6',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'closed',
    stage: 'المرحلة الأبتدائية',
    classroom: '1/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
  {
    id: '7',
    subject: 'لغة عربية',
    teacherName: 'أحمد معتز حسن',
    status: 'upcoming',
    stage: 'المرحلة الثانوية',
    classroom: '2/1 ع',
    date: '22/2/2025',
    startsAt: '10:00 صباحا',
    endsAt: '12:00 مساءا',
  },
];
