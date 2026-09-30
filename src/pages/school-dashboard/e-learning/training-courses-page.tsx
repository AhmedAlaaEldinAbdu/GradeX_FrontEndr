import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/useRedux';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import TrainingCoursesList from './components/TrainingCoursesList';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import TaskIcon from '@gradex/assets/icons/Task.svg';
import PeopleOutlineIcon from '@gradex/assets/icons/PeopleOutline.svg';

/** Tints a monochrome icon to the given colour via a CSS mask (keeps the SVG file untouched). */
function MaskIcon({ src, color }: { src: string; color: string }) {
  return (
    <span
      aria-hidden
      className="h-6 w-6"
      style={{
        backgroundColor: color,
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}

export default function TrainingCoursesPage() {
  const { t } = useTranslation();

  const activeCoursesCount = useAppSelector((s) => s.schoolCourses.activeCoursesCount);
  const totalStudentsCount = useAppSelector((s) => s.schoolCourses.totalStudentsCount);

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.courses.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <PageHeader
        title="eLearning.courses.title"
        hasHeaderControls={true}
        actions={[
          {
            label: '+',
            to: '/lms/courses/add',
            variant: 'primary',
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
      />

      {/* Main content */}
      <div className="space-y-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title={t('eLearning.courses.metrics.activeCourses')}
            value={`${activeCoursesCount} ${t('eLearning.courses.units.course')}`}
            icon={<MaskIcon src={TaskIcon} color="#117BD7" />}
            iconClassName="bg-blue-500/16"
          />
          <MetricCard
            title={t('eLearning.courses.metrics.totalStudents')}
            value={`${totalStudentsCount} ${t('eLearning.courses.units.student')}`}
            icon={<MaskIcon src={PeopleOutlineIcon} color="#C8A713" />}
            iconClassName="bg-[#F6CB3B]/16"
          />
          <MetricCard
            title={t('eLearning.courses.metrics.attendanceRate')}
            value="78%"
            icon={<CustomImage src={CheckMarkIcon} alt="" className="h-6 w-6" />}
            iconClassName="bg-lightGreen-500/16"
          />
        </div>

        {/* Courses list */}
        <TrainingCoursesList />
      </div>
    </div>
  );
}
