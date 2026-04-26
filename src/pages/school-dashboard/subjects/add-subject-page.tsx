import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddSubject from './components/AddSubject';

export default function AddSubjectPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.eduStages') },
    { label: t('subjects.title'), path: '/subjects' },
    { label: t('subjects.addSubject') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="subjects.addSubject" />

      {/* Main Content */}
      <AddSubject />
    </div>
  );
}
