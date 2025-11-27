import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import SystemUsers from './components/SystemUsers';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const SystemUsersPage: React.FC = () => {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[{ label: 'rolesManagement.title' }, { label: 'rolesManagement.systemUsers' }]}
      />

      {/* Page Header */}
      <PageHeader
        title="rolesManagement.systemUsers"
        actions={[
          {
            label: 'rolesManagement.addUser',
            to: 'add-user',
            imgSrc: PlusIcon,
            imgClassName: `w-[24px] h-[24px]`,
          },
        ]}
      />

      {/* Main Content */}
      <SystemUsers />
    </div>
  );
};

export default SystemUsersPage;
