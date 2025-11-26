import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditGrade from './components/EditGrade';

export default function EditGradePage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.educationalStages') },
    { label: t('grades.title'), path: '/grades' },
    { label: t('grades.editGrade') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="grades.editGrade" />

      {/* Main Content */}
      <EditGrade />
    </div>
  );
}
