import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Tabs, { type TabItem } from '@/shared/components/Tabs';
import ExamSummaryBanner from './components/ExamSummaryBanner';
import ExamResultsDistribution from './components/ExamResultsDistribution';
import ExamQuestionsList from './components/ExamQuestionsList';
import ExamStudentsList from './components/ExamStudentsList';
import { EXAM_DETAILS } from './components/examDetailsData';

export default function ExamDetailsPage() {
  const { t } = useTranslation();
  const exam = EXAM_DETAILS;

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.onlineExams.title'), path: '/lms/online-exams' },
    { label: exam.name },
  ];

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: t('eLearning.onlineExams.details.tabs.overview'),
      content: <ExamResultsDistribution />,
    },
    {
      id: 'questions',
      label: t('eLearning.onlineExams.details.tabs.questions'),
      content: <ExamQuestionsList />,
    },
    {
      id: 'students',
      label: t('eLearning.onlineExams.details.tabs.students'),
      content: <ExamStudentsList />,
    },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={exam.name} hasHeaderControls={false} />

      <div className="space-y-6">
        <ExamSummaryBanner exam={exam} />

        <Tabs
          items={tabs}
          searchParamKey="tab"
          listClassName="flex justify-start gap-3"
          panelClassName="mt-4"
        />
      </div>
    </div>
  );
}
