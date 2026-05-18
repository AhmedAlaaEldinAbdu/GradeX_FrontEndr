import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddJobRole from './components/AddJobRole';

export default function AddJobRolePage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.systemSettings') },
    { label: t('sidebar.settings') },
    { label: t('sidebar.jobRoles'), path: '/settings/job-roles' },
    { label: t('rolesManagement.addRole') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader title="rolesManagement.addRole" />

      {/* Main Content */}
      <AddJobRole />
    </div>
  );
}
