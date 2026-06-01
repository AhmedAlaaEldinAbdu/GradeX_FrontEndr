import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import MetricCard from '@/shared/components/MetricCard';
import CustomImage from '@/shared/components/CustomImage';
import ExamCreationCard from './components/ExamCreationCard';
import OnlineExamsList from './components/OnlineExamsList';
import CreateExamPopup from './components/CreateExamPopup';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import CheckMarkIcon from '@gradex/assets/icons/CheckMark.svg';
import TaskIcon from '@gradex/assets/icons/Task.svg';
import SparklesIcon from '@gradex/assets/icons/Sparkles.svg';
import IdeaIcon from '@gradex/assets/icons/Idea.svg';
import WritingIcon from '@gradex/assets/icons/Writing.svg';

export default function OnlineExamsPage() {
  const { t } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.onlineExams.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <PageHeader
        title="eLearning.onlineExams.title"
        hasHeaderControls={true}
        actions={[
          {
            label: 'eLearning.onlineExams.createNew',
            onClick: () => setIsCreateOpen(true),
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-6 h-6',
          },
        ]}
      />

      {/* Main content */}
      <div className="space-y-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MetricCard
            title={t('eLearning.metrics.successRate')}
            value="78%"
            icon={<CustomImage src={CheckMarkIcon} alt="Success rate" className="h-6 w-6" />}
            iconClassName="bg-[#1A9F58]/[0.16]"
          />
          <MetricCard
            title={t('eLearning.metrics.activeExams')}
            value={`30 ${t('eLearning.units.exam')}`}
            icon={
              <span
                aria-hidden
                className="h-6 w-6 bg-[#C8A713]"
                style={{
                  maskImage: `url("${TaskIcon}")`,
                  WebkitMaskImage: `url("${TaskIcon}")`,
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}
              />
            }
            iconClassName="bg-[#F6CB3B]/[0.16]"
          />
        </div>

        {/* Exam creation methods */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <ExamCreationCard
            icon={WritingIcon}
            title={t('eLearning.onlineExams.create.manual.title')}
            description={t('eLearning.onlineExams.create.manual.description')}
            className="bg-green-500"
          />
          <ExamCreationCard
            icon={IdeaIcon}
            title={t('eLearning.onlineExams.create.questionBank.title')}
            description={t('eLearning.onlineExams.create.questionBank.description')}
            className="bg-[#A353DD]"
          />
          <ExamCreationCard
            icon={SparklesIcon}
            title={t('eLearning.onlineExams.create.ai.title')}
            description={t('eLearning.onlineExams.create.ai.description')}
            className="bg-[#117BD7]"
          />
        </div>

        {/* Exams list */}
        <Card className="rounded-3xl border border-[#DDE0E0]" padding="md">
          <OnlineExamsList />
        </Card>
      </div>

      {/* Create new exam popup */}
      <CreateExamPopup isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
