import type { Lesson } from '@/services/api/types/lessons.types';
import type { LessonData } from './LessonForm';

export function mapLessonToFormData(lesson: Lesson): LessonData {
  return {
    id: lesson.id,
    lessonType: 'in-person',
    materialId: lesson.materialId,
    teacherId: lesson.teacherId,
    gradeId: lesson.gradeId,
    classroomId: lesson.classroomId,
    bookId: lesson.bookId,
    classworkFromPage: String(lesson.classworkFromPage),
    classworkToPage: String(lesson.classworkToPage),
    homeworkFromPage: String(lesson.homeworkFromPage),
    homeworkToPage: String(lesson.homeworkToPage),
    descriptionAr: lesson.homeworkDescriptionAr || '',
    descriptionEn: lesson.homeworkDescriptionEn || '',
    date: lesson.date ? lesson.date.split('T')[0] : '',
    startTime: lesson.startTime ? lesson.startTime.substring(0, 5) : '',
    endTime: lesson.endTime ? lesson.endTime.substring(0, 5) : '',
    applyToAllWeeks: lesson.applyToAllWeeks ?? lesson.ApplyToAllWeeks ?? false,
    isHomeworkForAllStudents: lesson.isHomeworkForAllStudents,
    attachments:
      lesson.attachments?.map((a) => ({
        fileName: a.fileName,
        oldFile: a.fileName,
        fileUrl: a.fileUrl,
      })) || [],
    selectedStudents:
      lesson.lessonsStudent?.map((s) => ({
        id: s.studentId,
        name: s.studentName || '',
        avatar: s.studentProfilePicture || '',
      })) || [],
  };
}

export const buildLessonDateTime = (date: string, time: string): string => {
  const datePart = date?.split('T')[0];
  const timePart = time || '08:00';
  const timeWithSeconds = timePart.split(':').length === 3 ? timePart : `${timePart}:00`;
  const lessonDate = datePart ? new Date(`${datePart}T${timeWithSeconds}`) : new Date();

  return Number.isNaN(lessonDate.getTime()) ? new Date().toISOString() : lessonDate.toISOString();
};
