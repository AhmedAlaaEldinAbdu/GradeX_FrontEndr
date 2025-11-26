import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddGrade from './components/AddGrade';

export default function AddGradePage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.educationalStages') },
    { label: t('grades.title'), path: '/grades' },
    { label: t('grades.addGrade') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="grades.addGrade" />

      {/* Main Content */}
      <AddGrade />
    </div>
  );
}
