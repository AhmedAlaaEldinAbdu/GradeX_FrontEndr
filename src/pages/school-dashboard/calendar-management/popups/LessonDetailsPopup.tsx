import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import type { ScheduleLesson } from '@/shared/components/WeeklyScheduleCalendar';
import type { Lesson } from '@/services/api/types/lessons.types';
import { lessonsApiService } from '@/services/api/lessons/lessons.service';
import { studentsApiService } from '@/services/api/students/students.service';
import type { StudentDto } from '@/services/api/types/students.types';
import { getStudentFullName } from '@/services/api/types/students.types';
import { formatTimeDisplay, formatDateDisplay } from '@/lib/utils';
import DefaultAvatar from '@gradex/assets/images/profile.png';

interface LessonDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ScheduleLesson | null;
}

export default function LessonDetailsPopup({ isOpen, onClose, lesson }: LessonDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const [lessonDetails, setLessonDetails] = useState<Lesson | null>(null);
  const [firstStudent, setFirstStudent] = useState<StudentDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLang = i18n.language;

  // Fetch full lesson details when popup opens
  useEffect(() => {
    if (isOpen && lesson?.id) {
      setIsLoading(true);
      setError(null);
      setFirstStudent(null);

      lessonsApiService
        .getLessonById(lesson.id)
        .then(async (details) => {
          setLessonDetails(details);

          // Fetch first student details if there are students assigned
          if (details.lessonsStudent && details.lessonsStudent.length > 0) {
            const firstStudentId = details.lessonsStudent[0].studentId;
            try {
              const studentDetails = await studentsApiService.getStudentById(firstStudentId);
              setFirstStudent(studentDetails);
            } catch {
              console.warn('Failed to fetch student details');
            }
          }
        })
        .catch((err) => {
          setError(err?.message || t('common.error'));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!isOpen) {
      // Reset when closed
      setLessonDetails(null);
      setFirstStudent(null);
      setError(null);
    }
  }, [isOpen, lesson?.id, t]);

  if (!lesson) return null;

  const subjectName =
    currentLang === 'ar'
      ? lessonDetails?.materialNameAr
      : lessonDetails?.materialNameEn || lessonDetails?.materialNameAr;

  const gradeName =
    currentLang === 'ar'
      ? lessonDetails?.gradeNameAr
      : lessonDetails?.gradeNameEn || lessonDetails?.gradeNameAr;

  const classroomName =
    currentLang === 'ar'
      ? lessonDetails?.classroomNameAr
      : lessonDetails?.classroomNameEn || lessonDetails?.classroomNameAr;

  // Calculate student count display
  const studentCount = lessonDetails?.lessonsStudent?.length || 0;
  const remainingStudents = studentCount > 1 ? studentCount - 1 : 0;

  // Get first student name and image
  const firstStudentName = firstStudent ? getStudentFullName(firstStudent) : null;
  const firstStudentImage = firstStudent?.profilePicture || null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton>
      <div className="px-8 py-6" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : lessonDetails ? (
          <div className="space-y-4">
            {/* Date Header - Centered */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                {formatDateDisplay(lessonDetails.date, currentLang)}
              </h2>
            </div>

            {/* Row 1: Start Time & End Time - right aligned, grouped */}
            <div className="flex items-center justify-start gap-16">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.startTime')}:</span>
                <span className="font-medium text-gray-800">
                  {formatTimeDisplay(lessonDetails.startTime, currentLang)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.endTime')}:</span>
                <span className="font-medium text-gray-800">
                  {formatTimeDisplay(lessonDetails.endTime, currentLang)}
                </span>
              </div>
            </div>

            {/* Row 2: Subject Name & Teacher Name - right aligned, grouped */}
            <div className="flex items-center justify-start gap-12">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.subjectName')}:</span>
                <span className="font-medium text-gray-800">{subjectName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.teacherName')}:</span>
                <span className="font-medium text-gray-800">{lessonDetails.teacherName}</span>
              </div>
            </div>

            {/* Row 3: Book Name - right aligned */}
            <div className="flex items-center justify-start gap-2">
              <span className="text-sm text-gray-500">{t('weeklyCalendar.bookName')}:</span>
              <span className="font-medium text-gray-800">{lessonDetails.bookName}</span>
            </div>

            {/* Row 4: Classwork - title on right, pages flowing left */}
            <div className="flex items-center justify-start gap-6">
              <span className="font-medium text-gray-800">{t('weeklyCalendar.classwork')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.fromPage')}:</span>
                <span className="font-medium text-gray-800">{lessonDetails.classworkFromPage}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.toPage')}:</span>
                <span className="font-medium text-gray-800">{lessonDetails.classworkToPage}</span>
              </div>
            </div>

            {/* Row 5: Homework - title on right, pages flowing left */}
            <div className="flex items-center justify-start gap-6">
              <span className="font-medium text-gray-800">{t('weeklyCalendar.homework')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.fromPage')}:</span>
                <span className="font-medium text-gray-800">{lessonDetails.homeworkFromPage}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('weeklyCalendar.toPage')}:</span>
                <span className="font-medium text-gray-800">{lessonDetails.homeworkToPage}</span>
              </div>
            </div>

            {/* Row 6: Selected Students - right aligned with first student image and name */}
            <div className="flex items-center justify-start gap-2">
              <span className="text-sm text-gray-500">{t('weeklyCalendar.assigned')}:</span>
              <img
                src={firstStudentImage || DefaultAvatar}
                alt={firstStudentName || 'Student'}
                className="h-8 w-8 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to default avatar if image fails to load
                  (e.target as HTMLImageElement).src = DefaultAvatar;
                }}
              />
              <span className="text-sm text-gray-600">
                {firstStudentName || t('weeklyCalendar.allStudents')}
              </span>
              {remainingStudents > 0 && (
                <span className="text-sm text-primary-600">+{remainingStudents}</span>
              )}
            </div>

            {/* Row 7: Educational Stages - right aligned */}
            <div className="flex items-center justify-start gap-2">
              <span className="text-sm text-gray-500">
                {t('weeklyCalendar.educationalStages')}:
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {gradeName}
              </span>
            </div>

            {/* Row 8: Classroom - right aligned */}
            <div className="flex items-center justify-start gap-2">
              <span className="text-sm text-gray-500">{t('weeklyCalendar.classrooms')}:</span>
              <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700">
                {classroomName}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
