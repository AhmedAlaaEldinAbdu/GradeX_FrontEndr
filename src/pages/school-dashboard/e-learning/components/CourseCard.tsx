import { useTranslation } from 'react-i18next';
import Badge from '@/shared/components/Badge';
import CustomImage from '@/shared/components/CustomImage';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import UserIcon from '@gradex/assets/icons/User.svg';
import PeopleOutlineIcon from '@gradex/assets/icons/PeopleOutline.svg';
import BookIcon from '@gradex/assets/icons/Book.svg';
import CalendarIcon from '@gradex/assets/icons/calendar.svg';
import DocumentEditOutlineIcon from '@gradex/assets/icons/DocumentEditOutline.svg';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import EditFillIcon from '@gradex/assets/icons/EditFill.svg';
import TrashFillIcon from '@gradex/assets/icons/TrashFill.svg';
import LearningCover from '@gradex/assets/images/Learning.png';
import { TrainingCourseStatus } from '@/shared/enums/enums';

export type CourseItem = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  status: TrainingCourseStatus;
  progress: number;
  studentsCount: number;
  subject: string;
  materialNameAr: string;
  materialNameEn: string;
  dateRange: string;
  /** e.g. "6/24" */
  lessons: string;
  coverImage?: string | null;
};

type StatusBadgeInfo = {
  badges: Array<{ label: string; variant: 'success' | 'info' | 'default' }>;
};

function getStatusBadges(status: TrainingCourseStatus): StatusBadgeInfo {
  switch (status) {
    case TrainingCourseStatus.ActiveCompleted:
      return {
        badges: [
          { label: 'eLearning.courses.status.active', variant: 'success' },
          { label: 'eLearning.courses.status.completed', variant: 'success' },
        ],
      };
    case TrainingCourseStatus.ActiveInCompleted:
      return {
        badges: [
          { label: 'eLearning.courses.status.active', variant: 'success' },
          { label: 'eLearning.courses.status.incomplete', variant: 'info' },
        ],
      };
    case TrainingCourseStatus.EndedCompleted:
      return {
        badges: [
          { label: 'eLearning.courses.status.ended', variant: 'default' },
          { label: 'eLearning.courses.status.completed', variant: 'success' },
        ],
      };
    case TrainingCourseStatus.EndedInCompleted:
      return {
        badges: [
          { label: 'eLearning.courses.status.ended', variant: 'default' },
          { label: 'eLearning.courses.status.incomplete', variant: 'info' },
        ],
      };
    case TrainingCourseStatus.NotStarted:
      return {
        badges: [{ label: 'eLearning.courses.status.notStarted', variant: 'default' }],
      };
    default:
      return {
        badges: [{ label: 'eLearning.courses.status.unknown', variant: 'default' }],
      };
  }
}

function CourseInfoBox({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black-100 p-3">
      {/* Tint any monochrome icon green via a CSS mask (keeps the SVG file untouched). */}
      <span
        aria-hidden
        className="h-6 w-6 shrink-0 bg-green-500"
        style={{
          maskImage: `url("${icon}")`,
          WebkitMaskImage: `url("${icon}")`,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
        }}
      />
      <span className="text-sm font-normal text-[#646969]">{text}</span>
    </div>
  );
}

type CourseCardProps = {
  course: CourseItem;
  onView?: (course: CourseItem) => void;
  onEdit?: (course: CourseItem) => void;
  onDelete?: (course: CourseItem) => void;
};

export default function CourseCard({ course, onView, onEdit, onDelete }: CourseCardProps) {
  const { t } = useTranslation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const progress = Math.min(100, Math.max(0, course.progress));

  const actions: Action[] = [
    {
      id: 'view',
      label: t('eLearning.courses.actions.view'),
      icon: EyeStyledIcon,
      onClick: () => onView?.(course),
    },
    {
      id: 'edit',
      label: t('eLearning.courses.actions.edit'),
      icon: EditFillIcon,
      onClick: () => onEdit?.(course),
    },
    {
      id: 'delete',
      label: t('eLearning.courses.actions.delete'),
      icon: TrashFillIcon,
      color: 'text-red-500 hover:bg-red-50',
      onClick: () => onDelete?.(course),
    },
  ];

  return (
    <div className="app-card-shadow flex flex-col overflow-hidden rounded-3xl border border-black-100 bg-white">
      {/* Cover (falls back to a default image when the course has none) */}
      <div className="relative h-[163px] w-full overflow-hidden">
        <CustomImage
          src={baseUrl + '/' + course.coverImage || LearningCover}
          fallbackSrc={LearningCover}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="bg-black/30 absolute inset-0" />
        <div className="absolute top-3 left-3">
          <ActionsDropdown
            actions={actions}
            iconClassName="h-4 w-4"
            triggerClassName="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50/60 transition-colors hover:bg-gray-50"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col items-start gap-1.5 text-start">
            <h4 className="text-base font-normal text-black-900">{course.title}</h4>
            <p className="text-xs font-normal text-[#3A3A3A]">{course.description}</p>
            <div className="flex items-center gap-2 text-sm font-normal text-[#646969]">
              <CustomImage src={UserIcon} alt="" className="h-4 w-4" />
              {course.instructor}
            </div>
          </div>
          <div className="flex gap-2">
            {getStatusBadges(course.status).badges.map((badge, idx) => (
              <Badge key={idx} variant={badge.variant}>
                {t(badge.label)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-lightGreen-500">{progress}%</span>
          <div className="h-2 flex-1 rounded-full bg-[#E8E9E9]/60">
            <div
              className="h-full rounded-full bg-lightGreen-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-normal text-[#646969]">
            {t('eLearning.courses.progress')}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2">
          <CourseInfoBox icon={BookIcon} text={course.subject} />
          <CourseInfoBox
            icon={PeopleOutlineIcon}
            text={`${course.studentsCount} ${t('eLearning.courses.units.student')}`}
          />
          <CourseInfoBox
            icon={DocumentEditOutlineIcon}
            text={`${course.lessons} ${t('eLearning.courses.lessonsUnit')}`}
          />
          <CourseInfoBox icon={CalendarIcon} text={course.dateRange} />
        </div>
      </div>
    </div>
  );
}
