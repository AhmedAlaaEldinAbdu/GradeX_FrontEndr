import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditSystemUser from './components/EditSystemUser';

export default function EditSystemUserPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.systemSettings') },
    { label: t('sidebar.settings') },
    { label: t('sidebar.jobRoles'), path: '/settings/job-roles' },
    { label: t('rolesManagement.systemUsers'), path: '/settings/job-roles?tab=system-users' },
    { label: t('rolesManagement.editUser') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="rolesManagement.editUser" />

      {/* Main Content */}
      <EditSystemUser />
    </div>
  );
}
