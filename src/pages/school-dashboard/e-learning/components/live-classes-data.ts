export type LiveClassStatus = 'draft' | 'started' | 'completed' | 'cancelled';

export type LiveClassRow = {
  id: string;
  teacherId: string;
  classroomId: string;
  lessonStatus?: number | null;
  subject: string;
  teacherName: string;
  status: LiveClassStatus;
  stage: string;
  classroom: string;
  date: string;
  dateValue?: string;
  startsAt: string;
  endsAt: string;
};
