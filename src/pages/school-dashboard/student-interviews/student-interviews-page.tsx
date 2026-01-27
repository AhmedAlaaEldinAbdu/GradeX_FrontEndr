import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentInterviewsCalendar from './components/StudentInterviewsCalendar';

export default function StudentInterviewsPage() {
  const { t } = useTranslation();

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
