import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditClassroom from './components/EditClassroom';

export default function EditClassroomPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.educationalStages') },
    { label: t('grades.title'), path: '/classrooms' },
    { label: t('grades.editGrade') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="grades.editGrade" />

      {/* Main Content */}
      <EditClassroom />
    </div>
  );
}
