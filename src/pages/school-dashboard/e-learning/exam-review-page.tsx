import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import ReviewSummaryBanner from './components/ReviewSummaryBanner';
import ReviewCorrectionList from './components/ReviewCorrectionList';
import { EXAM_DETAILS } from './components/examDetailsData';

export default function ExamReviewPage() {
  const { t } = useTranslation();
  const exam = EXAM_DETAILS;

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.lms') },
    { label: t('eLearning.onlineExams.title'), path: '/lms/online-exams' },
    { label: exam.name, path: `/lms/online-exams/${exam.id}` },
    { label: t('eLearning.onlineExams.details.studentsTable.reviewCorrection') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="eLearning.onlineExams.details.studentsTable.reviewCorrection"
        hasHeaderControls={false}
      />

      <div className="space-y-6">
        <ReviewSummaryBanner />
        <ReviewCorrectionList />
      </div>
    </div>
  );
}
