import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentInterviewsCalendar from './components/StudentInterviewsCalendar';
import PageHeader from '@/shared/components/PageHeader';
import { useAppSelector } from '@/hooks/useRedux';

export default function StudentInterviewsPage() {
  const { t } = useTranslation();
  const totalInterviews = useAppSelector((state) => state.studentInterviews.pagination.totalItems);

  const breadcrumbItems = [
    { label: t('sidebar.studentAffairs') },
    { label: t('sidebar.studentManagement') },
    { label: t('interviews.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={'interviews.title'}
        statistics={{ value: totalInterviews, label: 'interviews.interviewCount' }}
      />

      <StudentInterviewsCalendar />
    </div>
  );
}
