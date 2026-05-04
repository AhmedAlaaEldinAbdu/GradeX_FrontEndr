import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import type { ScheduleLesson } from '@/shared/components/WeeklyScheduleCalendar';
import type { Lesson } from '@/services/api/types/lessons.types';
import type { StudentDto } from '@/services/api/types/students.types';
import { getStudentFullName } from '@/services/api/types/students.types';
import { formatTimeDisplay, formatDateDisplay } from '@/lib/utils';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import CustomImage from '@/shared/components/CustomImage';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchLessonByIdSilent } from '@/redux/features/lessons/lessonsSlice';
import { fetchStudentByIdSilent } from '@/redux/features/students/studentsSlice';

interface LessonDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ScheduleLesson | null;
}

export default function LessonDetailsPopup({ isOpen, onClose, lesson }: LessonDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
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

      (async () => {
        try {
          const details = await dispatch(fetchLessonByIdSilent(lesson.id)).unwrap();
          setLessonDetails(details);

          // Fetch first student details if there are students assigned
          if (details.lessonsStudent && details.lessonsStudent.length > 0) {
            const firstStudentId = details.lessonsStudent[0].studentId;
            try {
              const studentDetails = await dispatch(
                fetchStudentByIdSilent(firstStudentId)
              ).unwrap();
              setFirstStudent(studentDetails);
            } catch {
              console.warn('Failed to fetch student details');
            }
          }
        } catch (err) {
          setError((err as { message?: string })?.message || t('common.error'));
        } finally {
          setIsLoading(false);
        }
      })();
    } else if (!isOpen) {
      // Reset when closed
      setLessonDetails(null);
      setFirstStudent(null);
      setError(null);
    }
  }, [dispatch, isOpen, lesson?.id, t]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton
      showHeader={true}
      title={lessonDetails ? formatDateDisplay(lessonDetails.date, currentLang) : ''}
    >
      <div className="px-8 py-6" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="border-primary-500 h-10 w-10 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : lessonDetails ? (
          <div className="space-y-5">
            {/* Row 1: Start Time & End Time */}
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.startTime')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {formatTimeDisplay(lessonDetails.startTime, currentLang)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.endTime')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {formatTimeDisplay(lessonDetails.endTime, currentLang)}
                </span>
              </div>
            </div>

            {/* Row 2: Subject Name & Teacher Name */}
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.subjectName')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">{subjectName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.teacherName')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {lessonDetails.teacherName}
                </span>
              </div>
            </div>

            {/* Row 3: Book Name */}
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-[#3A3A3A]">
                {t('weeklyCalendar.bookName')}:
              </span>
              <span className="text-sm font-normal text-[#3A3A3A]">{lessonDetails.bookName}</span>
            </div>

            {/* Row 4: Classwork */}
            <div className="grid grid-cols-3 gap-4">
              <span className="flex items-start text-base font-medium text-[#3A3A3A]">
                {t('weeklyCalendar.classwork')}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-start text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.fromPage')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {lessonDetails.classworkFromPage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-start text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.toPage')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {lessonDetails.classworkToPage}
                </span>
              </div>
            </div>

            {/* Row 5: Homework */}
            <div className="grid grid-cols-3 gap-4">
              <span className="flex items-start text-base font-medium text-[#3A3A3A]">
                {t('weeklyCalendar.homework')}
              </span>
              <div className="flex items-center gap-2">
                <span className="flex items-start text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.fromPage')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {lessonDetails.homeworkFromPage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-start text-base font-medium text-[#3A3A3A]">
                  {t('weeklyCalendar.toPage')}:
                </span>
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {lessonDetails.homeworkToPage}
                </span>
              </div>
            </div>

            {/* Row 6: Selected Students */}
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-[#3A3A3A]">
                {t('weeklyCalendar.assigned')}:
              </span>
              {remainingStudents > 0 ? (
                <span className="flex items-center gap-2">
                  <CustomImage
                    src={firstStudentImage || DefaultAvatar}
                    alt={firstStudentName || 'Student'}
                    fallbackSrc={DefaultAvatar}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                  <span className="text-sm font-normal text-[#3A3A3A]">{firstStudentName}</span>
                  <span className="text-sm font-normal text-green-500">+{remainingStudents}</span>
                </span>
              ) : (
                <span className="text-sm font-normal text-[#3A3A3A]">
                  {t('weeklyCalendar.allStudents')}
                </span>
              )}
            </div>

            {/* Row 7: Educational Stages */}
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-[#3A3A3A]">
                {t('weeklyCalendar.educationalStages')}:
              </span>
              <span className="rounded-lg bg-[#DFF8ED] px-3 py-1 text-lg font-normal text-[#3A3A3A]">
                {gradeName}
              </span>
            </div>

            {/* Row 8: Classroom */}
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-[#3A3A3A]">
                {t('weeklyCalendar.classrooms')}:
              </span>
              <span className="rounded-lg bg-[#DFF8ED] px-3 py-1 text-lg font-normal text-[#3A3A3A]">
                {classroomName}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
