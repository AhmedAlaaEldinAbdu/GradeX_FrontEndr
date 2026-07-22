import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import { useAppSelector } from '@/hooks/useRedux';
import LiveClassesList from './components/LiveClassesList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import PeopleOutlineIcon from '@gradex/assets/icons/PeopleOutline.svg';
import StudentYellowIcon from '@gradex/assets/icons/StudentYellow.svg';

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

export default function LiveClassesPage() {
  const { t } = useTranslation();
  const directLessonsStats = useAppSelector((state) => state.lessons.directLessonsStats);
  const directLessonsPagination = useAppSelector((state) => state.lessons.directLessonsPagination);

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.liveClasses.title') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="eLearning.liveClasses.title"
        hasHeaderControls={true}
        actions={[
          {
            label: '+',
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
            to: '/lms/live-classes/add',
          },
        ]}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            title={t('eLearning.liveClasses.metrics.totalRemoteClasses')}
            value={String(directLessonsPagination.totalItems)}
            icon={<MaskIcon src={PeopleOutlineIcon} color="#117BD7" />}
            iconClassName="bg-[#117BD7]/[0.16]"
          />
          <MetricCard
            title={t('eLearning.liveClasses.metrics.liveClassesNow')}
            value={String(directLessonsStats.startedNow)}
            icon={<CustomImage src={CheckMarkIcon} alt="" className="h-6 w-6" />}
            iconClassName="bg-[#1A9F58]/[0.16]"
          />
          <MetricCard
            title={t('eLearning.liveClasses.metrics.attendanceRate')}
            value={`${directLessonsStats.attendance}%`}
            icon={<CustomImage src={StudentYellowIcon} alt="" className="h-6 w-6" />}
            iconClassName="bg-[#F6CB3B]/[0.16]"
          />
        </div>

        <LiveClassesList />
      </div>
    </div>
  );
}
