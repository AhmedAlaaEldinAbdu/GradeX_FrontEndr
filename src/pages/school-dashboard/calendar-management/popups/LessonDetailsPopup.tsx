import { useTranslation } from 'react-i18next';
import Modal from '@/shared/popups/Modal';
import CustomImage from '@/shared/components/CustomImage';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import type { ScheduleLesson } from '@/shared/components/WeeklyScheduleCalendar';

interface LessonDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: ScheduleLesson | null;
}

export default function LessonDetailsPopup({ isOpen, onClose, lesson }: LessonDetailsPopupProps) {
  const { t } = useTranslation();

  if (!lesson) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-center gap-3">
          <CustomImage src={EyeStyledIcon} alt="Details" className="h-6 w-6" />
          <span>{t('weeklyCalendar.lessonDetails')}</span>
        </div>
      }
      size="sm"
    >
      <div className="p-6">
        <div className="space-y-4">
          {/* Subject */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('weeklyCalendar.subject')}</span>
            <span className="font-semibold text-gray-800">{lesson.subject}</span>
          </div>

          {/* Teacher */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('weeklyCalendar.teacher')}</span>
            <span className="font-semibold text-gray-800">{lesson.teacherName}</span>
          </div>

          {/* Start Time */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('weeklyCalendar.startTime')}</span>
            <span className="font-semibold text-gray-800">{lesson.startTime}ص</span>
          </div>

          {/* End Time */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('weeklyCalendar.endTime')}</span>
            <span className="font-semibold text-gray-800">{lesson.endTime}ص</span>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-sm text-gray-500">{t('weeklyCalendar.lessonDuration')}</span>
            <span className="font-semibold text-gray-800">
              {lesson.duration} {t('weeklyCalendar.minutes')}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
