import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditSubject from './components/EditSubject';

export default function EditSubjectPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.academicAffairs') },
    { label: t('sidebar.subjects') },
    { label: t('subjects.title'), path: '/subjects' },
    { label: t('subjects.editSubject') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="subjects.editSubject" />

      {/* Main Content */}
      <EditSubject />
    </div>
  );
}
