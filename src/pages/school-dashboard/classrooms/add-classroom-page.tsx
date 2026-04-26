import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddClassroom from './components/AddClassroom';

export default function AddClassroomPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.eduStages') },
    { label: t('grades.title'), path: '/classrooms' },
    { label: t('grades.addGrade') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="grades.addGrade" />

      {/* Main Content */}
      <AddClassroom />
    </div>
  );
}
