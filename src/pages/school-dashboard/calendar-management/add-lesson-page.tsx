import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddLesson from './components/AddLesson';

export default function AddLessonPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.weeklyCalendar'), path: '/school/calendar/weekly' },
    { label: t('addLesson.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="addLesson.title" />

      {/* Main Content */}
      <AddLesson />
    </div>
  );
}
