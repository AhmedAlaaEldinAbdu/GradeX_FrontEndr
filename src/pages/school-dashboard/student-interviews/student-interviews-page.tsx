import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentInterviewsCalendar from './components/StudentInterviewsCalendar';

export default function StudentInterviewsPage() {
  const { t } = useTranslation();

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
      <Breadcrumb items={[{ label: t('interviews.title') }]} />
      <div className="mb-6">
        <h1 className="text-start text-2xl font-bold text-gray-800">{t('interviews.title')}</h1>
      </div>
      <StudentInterviewsCalendar />
    </div>
  );
}
