import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import EditUser from './components/EditUser';

const EditUserPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'rolesManagement.title' },
          {
            label: 'rolesManagement.systemUsers',
            path: '/employees-administration/system-users',
          },
          { label: 'rolesManagement.editUser' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="rolesManagement.editUser" />

      {/* Main Content */}
      <EditUser />
    </div>
  );
};

export default EditUserPage;
