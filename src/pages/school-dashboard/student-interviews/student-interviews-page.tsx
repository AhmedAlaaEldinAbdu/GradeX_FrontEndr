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

  // TODO: Remove this temporary DEV check when the page is ready
  if (!import.meta.env.DEV) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">المقابلات</h2>
        <p className="mt-4 text-gray-600">قريباً...</p>
      </div>
    );
  }

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
