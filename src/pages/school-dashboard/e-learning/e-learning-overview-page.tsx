import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import MetricCard from '@/shared/components/MetricCard';
import EmptyState from '@/shared/components/EmptyState';
import CustomImage from '@/shared/components/CustomImage';
import MoodleSyncBanner from './components/MoodleSyncBanner';
import EducationalProgramsCard from './components/EducationalProgramsCard';
import EducationalContentCard from './components/EducationalContentCard';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import TeachersLightBlueIcon from '@gradex/assets/icons/TeachersLightBlue.svg';
import StudentYellowIcon from '@gradex/assets/icons/StudentYellow.svg';
import TaskBlueIcon from '@gradex/assets/icons/TaskBlue.svg';
import MathIcon from '@gradex/assets/icons/Math.svg';
import CourseMaterialIcon from '@gradex/assets/icons/CourseMaterial.svg';

export default function ELearningOverviewPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="eLearning.title" />

      {/* Main Content */}
      <div className="space-y-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t('eLearning.metrics.activeExams')}
            value={`0 ${t('eLearning.units.exam')}`}
            icon={<CustomImage src={TaskBlueIcon} alt="Active exams" className="h-5 w-5" />}
            iconClassName="bg-[#42ADFF]/10"
          />
          <MetricCard
            title={t('eLearning.metrics.totalStudents')}
            value={`0 ${t('eLearning.units.student')}`}
            icon={<CustomImage src={StudentYellowIcon} alt="Total students" className="h-5 w-5" />}
            iconClassName="bg-[#F6CB3B]/10"
          />
          <MetricCard
            title={t('eLearning.metrics.questionBank')}
            value={`0 ${t('eLearning.units.question')}`}
            icon={
              <CustomImage src={TeachersLightBlueIcon} alt="Question bank" className="h-5 w-5" />
            }
            iconClassName="bg-[#25BDD7]/10"
          />
          <MetricCard
            title={t('eLearning.metrics.successRate')}
            value="0%"
            icon={<CustomImage src={CheckMarkIcon} alt="Success rate" className="h-5 w-5" />}
            iconClassName="bg-[#1A9F58]/10"
          />
        </div>

        {/* Moodle sync banner */}
        <MoodleSyncBanner />

        {/* Educational content + programs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_309px]">
          <EducationalContentCard />
          <EducationalProgramsCard />
        </div>

        {/* Exams */}
        <Card className="rounded-3xl border border-[#DDE0E0]" padding="md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-base font-medium text-[#3A3A3A]">{t('eLearning.exams.title')}</h3>

            <button type="button" className="text-base font-medium text-green-500">
              {t('eLearning.exams.viewAll')}
            </button>
          </div>
          <EmptyState
            icon={
              <CustomImage
                src={MathIcon}
                alt=""
                className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
              />
            }
            description={t('eLearning.exams.emptyDescription')}
          />
        </Card>

        {/* Training courses */}
        <Card className="rounded-3xl border border-[#DDE0E0]" padding="md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-base font-medium text-[#3A3A3A]">{t('eLearning.courses.title')}</h3>

            <button type="button" className="text-base font-medium text-green-500">
              {t('eLearning.courses.viewAll')}
            </button>
          </div>
          <EmptyState
            icon={
              <CustomImage
                src={CourseMaterialIcon}
                alt=""
                className="mx-auto h-[150px] w-[150px] mix-blend-luminosity"
              />
            }
            description={t('eLearning.courses.emptyDescription')}
          />
        </Card>
      </div>
    </div>
  );
}
