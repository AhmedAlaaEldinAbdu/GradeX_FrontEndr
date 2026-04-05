export type TaskProgressStatus = 'completed' | 'pending' | 'late';
export type TaskCorrectionStatus = 'corrected' | 'notCorrected';
export type TaskType = 'quiz' | 'dictation' | 'training';

export interface TaskRecord {
    id: string;
    nameAr: string;
    nameEn: string;
    stageAr: string;
    stageEn: string;
    subjectAr: string;
    subjectEn: string;
    classroomAr: string;
    classroomEn: string;
    teacherName: string;
    dueDate: string;
    taskType: TaskType;
    progressStatus: TaskProgressStatus;
    correctionStatus: TaskCorrectionStatus;
    submissionsLabel: string;
}

export const TASK_TYPE_META: Record<TaskType, { className: string }> = {
    quiz: {
        className: 'bg-violet-100 text-violet-700',
    },
    dictation: {
        className: 'bg-cyan-100 text-cyan-700',
    },
    training: {
        className: 'bg-amber-100 text-amber-700',
    },
};

export const TASK_CORRECTION_META: Record<TaskCorrectionStatus, { className: string }> = {
    corrected: {
        className: 'bg-emerald-100 text-emerald-700',
    },
    notCorrected: {
        className: 'bg-rose-100 text-rose-700',
    },
};

export const TASKS_MOCK: TaskRecord[] = [
    {
        id: 'task-1',
        nameAr: 'اسم المهمة 1',
        nameEn: 'Task Name 1',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage',
        subjectAr: 'لغة عربية',
        subjectEn: 'Arabic Language',
        classroomAr: '1/1 ع',
        classroomEn: 'Class 1/1',
        teacherName: 'أحمد معتز حسن',
        dueDate: '2025-02-22',
        taskType: 'quiz',
        progressStatus: 'completed',
        correctionStatus: 'corrected',
        submissionsLabel: '23/30',
    },
    {
        id: 'task-2',
        nameAr: 'اسم المهمة 2',
        nameEn: 'Task Name 2',
        stageAr: 'المرحلة الثانوية',
        stageEn: 'Secondary Stage',
        subjectAr: 'لغة عربية',
        subjectEn: 'Arabic Language',
        classroomAr: '2/1 ع',
        classroomEn: 'Class 2/1',
        teacherName: 'أحمد معتز حسن',
        dueDate: '2025-02-22',
        taskType: 'quiz',
        progressStatus: 'pending',
        correctionStatus: 'corrected',
        submissionsLabel: '23/30',
    },
    {
        id: 'task-3',
        nameAr: 'اسم المهمة 3',
        nameEn: 'Task Name 3',
        stageAr: 'المرحلة الإعدادية',
        stageEn: 'Preparatory Stage',
        subjectAr: 'لغة عربية',
        subjectEn: 'Arabic Language',
        classroomAr: '1/1 ع',
        classroomEn: 'Class 1/1',
        teacherName: 'أحمد معتز حسن',
        dueDate: '2025-02-22',
        taskType: 'quiz',
        progressStatus: 'late',
        correctionStatus: 'notCorrected',
        submissionsLabel: '2/30',
    },
    {
        id: 'task-4',
        nameAr: 'اسم المهمة 4',
        nameEn: 'Task Name 4',
        stageAr: 'رياض الأطفال',
        stageEn: 'Kindergarten',
        subjectAr: 'لغة عربية',
        subjectEn: 'Arabic Language',
        classroomAr: '1/3 ع',
        classroomEn: 'Kindergarten',
        teacherName: 'أحمد معتز حسن',
        dueDate: '2025-02-22',
        taskType: 'dictation',
        progressStatus: 'completed',
        correctionStatus: 'notCorrected',
        submissionsLabel: '23/30',
    },
    {
        id: 'task-5',
        nameAr: 'اسم المهمة 5',
        nameEn: 'Task Name 5',
        stageAr: 'المرحلة الابتدائية',
        stageEn: 'Primary Stage',
        subjectAr: 'لغة عربية',
        subjectEn: 'Arabic Language',
        classroomAr: '1/3 ع',
        classroomEn: 'Class 1/3',
        teacherName: 'أحمد معتز حسن',
        dueDate: '2025-02-22',
        taskType: 'training',
        progressStatus: 'completed',
        correctionStatus: 'corrected',
        submissionsLabel: '23/30',
    },
];