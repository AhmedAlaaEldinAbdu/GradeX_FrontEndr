export type TaskProgressStatus = 'completed' | 'pending' | 'late';
export type TaskCorrectionStatus = 'corrected' | 'notCorrected';
export type TaskType = 'quiz' | 'dictation' | 'training' | 'homework';
export type TaskAssignmentType = 'all' | 'specific';

export interface TaskAttachment {
    id: string;
    name: string;
    sizeLabel: string;
    filePath: string;
}

export interface TaskRecord {
    id: string;
    teacherId: string;
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
    taskDate: string;
    deliveryDate: string;
    taskType: TaskType;
    progressStatus: TaskProgressStatus;
    correctionStatus: TaskCorrectionStatus;
    submissionsLabel: string;
    descriptionAr: string;
    descriptionEn: string;
    assignedTo: TaskAssignmentType;
    attachments: TaskAttachment[];
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
    homework: {
        className: 'bg-emerald-100 text-emerald-700',
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
        teacherId: 'bc3080ff-fb8a-4c07-6d23-08de492eac99',
        nameAr: 'اسم المهمة مهمة 1',
        nameEn: 'Task name in English: Task 1',
        stageAr: 'مرحلة رياض أطفال',
        stageEn: 'Kindergarten Stage',
        subjectAr: 'اللغة العربية',
        subjectEn: 'Arabic Language',
        classroomAr: 'KG 2',
        classroomEn: 'KG 2',
        teacherName: 'أحمد معتز حسن',
        dueDate: '2025-05-22',
        taskDate: '2025-05-22',
        deliveryDate: '2025-05-24',
        taskType: 'homework',
        progressStatus: 'completed',
        correctionStatus: 'corrected',
        submissionsLabel: '23/30',
        descriptionAr: 'لا يوجد وصف',
        descriptionEn: 'No description available',
        assignedTo: 'specific',
        attachments: [
            {
                id: 'task-1-attachment-1',
                name: 'اسم الواجب.pdf',
                sizeLabel: '520 KB',
                filePath: '/mock-task-homework.pdf',
            },
        ],
    },
    {
        id: 'task-2',
        teacherId: 'bc3080ff-fb8a-4c07-6d23-08de492eac99',
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
        taskDate: '2025-02-20',
        deliveryDate: '2025-02-22',
        taskType: 'quiz',
        progressStatus: 'pending',
        correctionStatus: 'corrected',
        submissionsLabel: '23/30',
        descriptionAr: 'حل الأسئلة من 1 إلى 5.',
        descriptionEn: 'Solve questions 1 through 5.',
        assignedTo: 'all',
        attachments: [
            {
                id: 'task-2-attachment-1',
                name: 'quiz-instructions.pdf',
                sizeLabel: '340 KB',
                filePath: '/mock-task-homework.pdf',
            },
        ],
    },
    {
        id: 'task-3',
        teacherId: 'bc3080ff-fb8a-4c07-6d23-08de492eac99',
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
        taskDate: '2025-02-18',
        deliveryDate: '2025-02-22',
        taskType: 'quiz',
        progressStatus: 'late',
        correctionStatus: 'notCorrected',
        submissionsLabel: '2/30',
        descriptionAr: 'مراجعة الدرس السابق مع الإجابة على الأسئلة.',
        descriptionEn: 'Review the previous lesson and answer the questions.',
        assignedTo: 'specific',
        attachments: [],
    },
    {
        id: 'task-4',
        teacherId: 'bc3080ff-fb8a-4c07-6d23-08de492eac99',
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
        taskDate: '2025-02-21',
        deliveryDate: '2025-02-22',
        taskType: 'dictation',
        progressStatus: 'completed',
        correctionStatus: 'notCorrected',
        submissionsLabel: '23/30',
        descriptionAr: 'تدريب إملائي على كلمات الوحدة.',
        descriptionEn: 'Dictation practice for the unit vocabulary.',
        assignedTo: 'all',
        attachments: [
            {
                id: 'task-4-attachment-1',
                name: 'dictation-sheet.pdf',
                sizeLabel: '410 KB',
                filePath: '/mock-task-homework.pdf',
            },
        ],
    },
    {
        id: 'task-5',
        teacherId: 'bc3080ff-fb8a-4c07-6d23-08de492eac99',
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
        taskDate: '2025-02-19',
        deliveryDate: '2025-02-22',
        taskType: 'training',
        progressStatus: 'completed',
        correctionStatus: 'corrected',
        submissionsLabel: '23/30',
        descriptionAr: 'تدريب قصير على الدرس الحالي.',
        descriptionEn: 'A short practice task for the current lesson.',
        assignedTo: 'specific',
        attachments: [
            {
                id: 'task-5-attachment-1',
                name: 'practice-worksheet.pdf',
                sizeLabel: '275 KB',
                filePath: '/mock-task-homework.pdf',
            },
        ],
    },
];