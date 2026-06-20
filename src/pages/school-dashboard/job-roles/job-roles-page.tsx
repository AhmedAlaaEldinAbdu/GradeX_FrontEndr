import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import JobRoles from './components/JobRoles';

export default function JobRolesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('roles-permissions');

  const breadcrumbItems = [
    { label: t('sidebar.systemSettings') },
    { label: t('sidebar.settings') },
    { label: t('sidebar.jobRoles') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="sidebar.jobRoles"
        actions={
          activeTab === 'roles-permissions'
            ? [
                {
                  label: 'rolesManagement.addRole',
                  to: '/settings/job-roles/add-role',
                  imgSrc: PlusIcon,
                  imgClassName: 'w-10 h-10',
                  circle: true,
                },
              ]
            : [
                {
                  label: 'rolesManagement.addUser',
                  to: '/settings/job-roles/add-user',
                  imgSrc: PlusIcon,
                  imgClassName: 'w-10 h-10',
                  circle: true,
                },
              ]
        }
        hasHeaderControls={true}
      />

      {/* Main Content */}
      <JobRoles onTabChange={setActiveTab} />
    </div>
  );
}
