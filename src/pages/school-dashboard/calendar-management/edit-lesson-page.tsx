import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditLesson from './components/EditLesson';

export default function EditLessonPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.calendarManagement') },
    { label: t('sidebar.weeklyCalendar'), path: '/school/calendar/weekly' },
    { label: t('lesson.editTitle') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="lesson.editTitle" />

      {/* Main Content */}
      <EditLesson />
    </div>
  );
}
