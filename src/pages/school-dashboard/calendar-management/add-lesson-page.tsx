import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddLesson from './components/AddLesson';

export default function AddLessonPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.weeklyCalendar'), path: '/school/calendar/weekly' },
    { label: t('lesson.addTitle') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="lesson.addTitle" />

      {/* Main Content */}
      <AddLesson />
    </div>
  );
}
