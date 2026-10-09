import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import Button from '@/shared/components/Button';
import CustomImage from '@/shared/components/CustomImage';
import type { ScheduleLesson } from '@/shared/components/WeeklyScheduleCalendar';
import type { Lesson } from '@/services/api/types/lessons.types';
import type { StudentDto } from '@/services/api/types/students.types';
import { getStudentFullName } from '@/services/api/types/students.types';
import { formatTimeDisplay, formatDateDisplay } from '@/lib/utils';
import DefaultAvatar from '@gradex/assets/images/profile.png';
import CloseXGreenIcon from '@/assets/icons/CloseXGreen.svg';
import ClockGray14Icon from '@/assets/icons/ClockGray14.svg';
import DownloadGreenIcon from '@/assets/icons/DownloadGreen.svg';
import { useAppDispatch } from '@/hooks/useRedux';
import { fetchLessonByIdSilent } from '@/redux/features/lessons/lessonsSlice';
import { fetchStudentByIdSilent } from '@/redux/features/students/studentsSlice';

interface LessonDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ScheduleLesson | null;
  onEdit?: (lesson: ScheduleLesson) => void;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 text-start">
      <span className="text-xs leading-4 text-[#9D9D9D]">{label}</span>
      <span className="text-sm leading-5 font-medium break-words text-[black]">
        {children || '-'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/50 p-4">
      <h3 className="text-start text-sm leading-5 font-bold text-[black]">{title}</h3>
      {children}
    </section>
  );
}

const resolveFileUrl = (fileUrl: string) => {
  if (fileUrl.startsWith('http')) return fileUrl;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  return `${baseUrl}/${fileUrl.replace(/^\//, '')}`;
};

const getDownloadName = (fileName: string, fileUrl: string) => {
  if (/\.[a-z0-9]{2,5}$/i.test(fileName)) return fileName;
  const extension = fileUrl.split('?')[0].match(/\.([a-z0-9]{2,5})$/i)?.[1];
  return extension ? `${fileName}.${extension}` : fileName;
};

const pageRange = (from?: number | null, to?: number | null) =>
  from || to ? `${from ?? '-'} - ${to ?? '-'}` : '';

export default function LessonDetailsPopup({
  isOpen,
  onClose,
  lesson,
  onEdit,
}: LessonDetailsPopupProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const [lessonDetails, setLessonDetails] = useState<Lesson | null>(null);
  const [firstStudent, setFirstStudent] = useState<StudentDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLang = i18n.language;
  const isArabic = currentLang === 'ar';
  const lessonId = lesson?.id;

  // Fetch full lesson details when popup opens
  useEffect(() => {
    if (!isOpen || !lessonId) {
      setLessonDetails(null);
      setFirstStudent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setFirstStudent(null);

    (async () => {
      try {
        const details = await dispatch(fetchLessonByIdSilent(lessonId)).unwrap();
        if (cancelled) return;
        setLessonDetails(details);

        const firstStudentId = details.lessonsStudent?.[0]?.studentId;
        if (firstStudentId) {
          try {
            const studentDetails = await dispatch(fetchStudentByIdSilent(firstStudentId)).unwrap();
            if (!cancelled) setFirstStudent(studentDetails);
          } catch {
            console.warn('Failed to fetch student details');
          }
        }
      } catch (err) {
        if (!cancelled) setError((err as { message?: string })?.message || t('common.error'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isOpen, lessonId, t]);

  const handleDownload = async (fileName: string, fileUrl: string) => {
    const url = resolveFileUrl(fileUrl);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(String(response.status));
      const blobUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getDownloadName(fileName, fileUrl);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!lesson) return null;

  const localized = (ar?: string | null, en?: string | null) => (isArabic ? ar : en || ar);
  const subjectName = localized(lessonDetails?.materialNameAr, lessonDetails?.materialNameEn);
  const gradeName = localized(lessonDetails?.gradeNameAr, lessonDetails?.gradeNameEn);
  const classroomName = localized(lessonDetails?.classroomNameAr, lessonDetails?.classroomNameEn);
  const homeworkDescription =
    lessonDetails?.homeworkDescription ||
    localized(lessonDetails?.homeworkDescriptionAr, lessonDetails?.homeworkDescriptionEn);

  const studentCount = lessonDetails?.lessonsStudent?.length || 0;
  const remainingStudents = studentCount > 1 ? studentCount - 1 : 0;
  const firstStudentName = firstStudent ? getStudentFullName(firstStudent) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showHeader={false}
      placement="end"
      panelClassName="max-w-[650px]! rounded-e-none rounded-s-lg border border-[#E2E8F0]/90 shadow-[0px_25px_50px_-12px_rgba(2,6,23,0.2)]! overflow-hidden"
      contentClassName="flex min-h-0 flex-col overflow-hidden! p-0!"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F1F5F9] px-8 pt-7 pb-[21px]">
        <div className="flex min-w-0 flex-col gap-1 text-start">
          <h2 className="truncate text-xl leading-7 font-bold text-[black]">
            {subjectName || lesson.subject}
          </h2>
          <p className="text-xs leading-4 text-[#9D9D9D]">
            {lessonDetails ? formatDateDisplay(lessonDetails.date, currentLang) : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="shrink-0 rounded-lg p-2 transition-colors hover:bg-[#F1F5F9]"
        >
          <CustomImage src={CloseXGreenIcon} alt="" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-5 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-[#A7F3D0] border-t-[#1E7A52]" />
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : lessonDetails ? (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-5 font-semibold text-[#1E7A52]">
              <CustomImage src={ClockGray14Icon} alt="" className="shrink-0" />
              <span className="flex items-center gap-1.5">
                <bdi>{formatTimeDisplay(lessonDetails.startTime, currentLang)}</bdi>
                <span aria-hidden="true">-</span>
                <bdi>{formatTimeDisplay(lessonDetails.endTime, currentLang)}</bdi>
              </span>
            </div>

            <Section title={t('weeklyCalendar.lessonDetails')}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow label={t('weeklyCalendar.subjectName')}>{subjectName}</DetailRow>
                <DetailRow label={t('weeklyCalendar.teacherName')}>
                  {lessonDetails.teacherName}
                </DetailRow>
              </div>
              <DetailRow label={t('weeklyCalendar.bookName')}>{lessonDetails.bookName}</DetailRow>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailRow label={t('weeklyCalendar.educationalStages')}>{gradeName}</DetailRow>
                <DetailRow label={t('weeklyCalendar.classrooms')}>{classroomName}</DetailRow>
              </div>
            </Section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Section title={t('weeklyCalendar.classwork')}>
                <DetailRow
                  label={`${t('weeklyCalendar.fromPage')} - ${t('weeklyCalendar.toPage')}`}
                >
                  {pageRange(lessonDetails.classworkFromPage, lessonDetails.classworkToPage)}
                </DetailRow>
              </Section>
              <Section title={t('weeklyCalendar.homework')}>
                <DetailRow
                  label={`${t('weeklyCalendar.fromPage')} - ${t('weeklyCalendar.toPage')}`}
                >
                  {pageRange(lessonDetails.homeworkFromPage, lessonDetails.homeworkToPage)}
                </DetailRow>
              </Section>
            </div>

            {lessonDetails.homeworkName ? (
              <DetailRow label={t('lesson.popup.homeworkName')}>
                {lessonDetails.homeworkName}
              </DetailRow>
            ) : null}

            {homeworkDescription ? (
              <DetailRow label={t('lesson.popup.homeworkDescription')}>
                {homeworkDescription}
              </DetailRow>
            ) : null}

            <div className="flex flex-col gap-1.5 text-start">
              <span className="text-xs leading-4 text-[#9D9D9D]">
                {t('weeklyCalendar.assigned')}
              </span>
              {remainingStudents > 0 || studentCount === 1 ? (
                <span className="flex items-center gap-2">
                  <CustomImage
                    src={firstStudent?.profilePicture || DefaultAvatar}
                    alt={firstStudentName || 'Student'}
                    fallbackSrc={DefaultAvatar}
                    className="size-9 rounded-lg object-cover"
                  />
                  <span className="text-sm font-medium text-[black]">{firstStudentName}</span>
                  {remainingStudents > 0 ? (
                    <span className="text-sm font-medium text-[#1E7A52]">+{remainingStudents}</span>
                  ) : null}
                </span>
              ) : (
                <span className="text-sm leading-5 font-medium text-[black]">
                  {t('weeklyCalendar.allStudents')}
                </span>
              )}
            </div>

            {lessonDetails.attachments?.length ? (
              <div className="flex flex-col gap-2 text-start">
                <span className="text-xs leading-4 text-[#9D9D9D]">
                  {t('lesson.popup.attachments')}
                </span>
                {lessonDetails.attachments.map((attachment) => (
                  <button
                    key={attachment.id ?? attachment.fileUrl}
                    type="button"
                    onClick={() => handleDownload(attachment.fileName, attachment.fileUrl)}
                    aria-label={`${t('common.download')} ${attachment.fileName}`}
                    title={t('common.download')}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/50 px-4 py-3 text-start transition-colors hover:border-[#1E7A52] hover:bg-[#ECFDF5]"
                  >
                    <span className="truncate text-sm leading-5 text-[#1E293B]">
                      {attachment.fileName}
                    </span>
                    <CustomImage src={DownloadGreenIcon} alt="" className="size-5 shrink-0" />
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#F1F5F9] bg-[#F8FAFC]/70 px-8 pt-[21px] pb-5">
        {onEdit && lessonDetails ? (
          <Button
            actionKey="edit"
            onClick={() => onEdit(lesson)}
            className="h-10 gap-2 rounded-lg! border-0! bg-[#1E7A52]! px-6! py-2.5! text-sm! leading-[19.6px] font-semibold! text-white! shadow-none! hover:bg-[#1E7A52]/90!"
          >
            {t('weeklyCalendar.editLesson')}
          </Button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="h-[42px] rounded-lg border border-[#1E7A52] bg-white px-[25px] text-sm leading-5 font-medium text-[#1E7A52] transition-colors hover:bg-[#F0FDF4]"
        >
          {t('common.close')}
        </button>
      </div>
    </Modal>
  );
}
