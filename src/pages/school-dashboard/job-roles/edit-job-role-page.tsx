import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditJobRole from './components/EditJobRole';

export default function EditJobRolePage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.systemSettings') },
    { label: t('sidebar.settings') },
    { label: t('sidebar.jobRoles'), path: '/settings/job-roles' },
    { label: t('rolesManagement.editRole') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="rolesManagement.editRole" />

      {/* Main Content */}
      <EditJobRole />
    </div>
  );
}
