import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import TeachersList from './components/TeachersList';

export default function TeachersPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [{ label: t('sidebar.teachingStaff') }, { label: t('teachers.title') }];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="teachers.title" />

      {/* Main Content */}
      <TeachersList />
    </div>
  );
}
