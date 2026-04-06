import DefaultAvatar from '@gradex/assets/images/profile.png';
import type { TaskAttachment, TaskCorrectionStatus } from './tasks.mock';

export interface TaskSubmissionRecord {
  id: string;
  taskId: string;
  studentNameAr: string;
  studentNameEn: string;
  classroomAr: string;
  classroomEn: string;
  correctionStatus: TaskCorrectionStatus;
  avatar: string;
  studentAttachments: TaskAttachment[];
  correctionBasedOnAr: string;
  correctionBasedOnEn: string;
  performanceAr: string;
  performanceEn: string;
  correctionAttachments: TaskAttachment[];
}

export const TASK_SUBMISSIONS_MOCK: TaskSubmissionRecord[] = [
  {
    id: 'submission-1',
    taskId: 'task-1',
    studentNameAr: 'أحمد معتز حسن',
    studentNameEn: 'Ahmed Moataz Hassan',
    classroomAr: 'الصف الأول الإعدادي - 1/ع',
    classroomEn: 'First Preparatory Grade - 1/A',
    correctionStatus: 'corrected',
    avatar: DefaultAvatar,
    studentAttachments: [
      {
        id: 'submission-1-student-attachment-1',
        name: 'اسم الواجب.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
    correctionBasedOnAr: 'التقييم',
    correctionBasedOnEn: 'Evaluation',
    performanceAr: 'ممتاز',
    performanceEn: 'Excellent',
    correctionAttachments: [
      {
        id: 'submission-1-correction-attachment-1',
        name: 'التصحيح.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
  },
  {
    id: 'submission-2',
    taskId: 'task-1',
    studentNameAr: 'أحمد معتز حسن',
    studentNameEn: 'Ahmed Moataz Hassan',
    classroomAr: 'الصف الأول الإعدادي - 1/ع',
    classroomEn: 'First Preparatory Grade - 1/A',
    correctionStatus: 'corrected',
    avatar: DefaultAvatar,
    studentAttachments: [
      {
        id: 'submission-2-student-attachment-1',
        name: 'اسم الواجب.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
    correctionBasedOnAr: 'التقييم',
    correctionBasedOnEn: 'Evaluation',
    performanceAr: 'ممتاز',
    performanceEn: 'Excellent',
    correctionAttachments: [
      {
        id: 'submission-2-correction-attachment-1',
        name: 'التصحيح.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
  },
  {
    id: 'submission-3',
    taskId: 'task-1',
    studentNameAr: 'أحمد معتز حسن',
    studentNameEn: 'Ahmed Moataz Hassan',
    classroomAr: 'الصف الأول الإعدادي - 1/ع',
    classroomEn: 'First Preparatory Grade - 1/A',
    correctionStatus: 'corrected',
    avatar: DefaultAvatar,
    studentAttachments: [
      {
        id: 'submission-3-student-attachment-1',
        name: 'اسم الواجب.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
    correctionBasedOnAr: 'التقييم',
    correctionBasedOnEn: 'Evaluation',
    performanceAr: 'ممتاز',
    performanceEn: 'Excellent',
    correctionAttachments: [
      {
        id: 'submission-3-correction-attachment-1',
        name: 'التصحيح.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
  },
  {
    id: 'submission-4',
    taskId: 'task-1',
    studentNameAr: 'أحمد معتز حسن',
    studentNameEn: 'Ahmed Moataz Hassan',
    classroomAr: 'الصف الأول الإعدادي - 1/ع',
    classroomEn: 'First Preparatory Grade - 1/A',
    correctionStatus: 'corrected',
    avatar: DefaultAvatar,
    studentAttachments: [
      {
        id: 'submission-4-student-attachment-1',
        name: 'اسم الواجب.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
    correctionBasedOnAr: 'التقييم',
    correctionBasedOnEn: 'Evaluation',
    performanceAr: 'ممتاز',
    performanceEn: 'Excellent',
    correctionAttachments: [
      {
        id: 'submission-4-correction-attachment-1',
        name: 'التصحيح.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
  },
  {
    id: 'submission-5',
    taskId: 'task-1',
    studentNameAr: 'أحمد معتز حسن',
    studentNameEn: 'Ahmed Moataz Hassan',
    classroomAr: 'الصف الأول الإعدادي - 1/ع',
    classroomEn: 'First Preparatory Grade - 1/A',
    correctionStatus: 'corrected',
    avatar: DefaultAvatar,
    studentAttachments: [
      {
        id: 'submission-5-student-attachment-1',
        name: 'اسم الواجب.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
    correctionBasedOnAr: 'التقييم',
    correctionBasedOnEn: 'Evaluation',
    performanceAr: 'ممتاز',
    performanceEn: 'Excellent',
    correctionAttachments: [
      {
        id: 'submission-5-correction-attachment-1',
        name: 'التصحيح.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
  },
  {
    id: 'submission-6',
    taskId: 'task-1',
    studentNameAr: 'أحمد معتز حسن',
    studentNameEn: 'Ahmed Moataz Hassan',
    classroomAr: 'الصف الأول الإعدادي - 1/ع',
    classroomEn: 'First Preparatory Grade - 1/A',
    correctionStatus: 'corrected',
    avatar: DefaultAvatar,
    studentAttachments: [
      {
        id: 'submission-6-student-attachment-1',
        name: 'اسم الواجب.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
    correctionBasedOnAr: 'التقييم',
    correctionBasedOnEn: 'Evaluation',
    performanceAr: 'ممتاز',
    performanceEn: 'Excellent',
    correctionAttachments: [
      {
        id: 'submission-6-correction-attachment-1',
        name: 'التصحيح.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
  },
  {
    id: 'submission-7',
    taskId: 'task-1',
    studentNameAr: 'أحمد معتز حسن',
    studentNameEn: 'Ahmed Moataz Hassan',
    classroomAr: 'الصف الأول الإعدادي - 1/ع',
    classroomEn: 'First Preparatory Grade - 1/A',
    correctionStatus: 'notCorrected',
    avatar: DefaultAvatar,
    studentAttachments: [
      {
        id: 'submission-7-student-attachment-1',
        name: 'اسم الواجب.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
    correctionBasedOnAr: 'التقييم',
    correctionBasedOnEn: 'Evaluation',
    performanceAr: 'جيد جدًا',
    performanceEn: 'Very Good',
    correctionAttachments: [
      {
        id: 'submission-7-correction-attachment-1',
        name: 'التصحيح.pdf',
        sizeLabel: '520 KB',
        filePath: '/mock-task-homework.pdf',
      },
    ],
  },
];