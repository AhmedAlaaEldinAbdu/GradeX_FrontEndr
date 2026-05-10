import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddEditUser from './components/AddEditUser';

const EditUserPage: React.FC = () => {
  return (
    <div>
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
      <AddEditUser mode="edit" />
    </div>
  );
};

export default EditUserPage;
