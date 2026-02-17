import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentInterviewsCalendar from './components/StudentInterviewsCalendar';
import PageHeader from '@/shared/components/PageHeader';

export default function StudentInterviewsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('interviews.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title={'interviews.title'} />

      <StudentInterviewsCalendar />
    </div>
  );
}
