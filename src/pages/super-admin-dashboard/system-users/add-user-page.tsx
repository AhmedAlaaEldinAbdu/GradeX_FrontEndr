import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddEditUser from './components/AddEditUser';

const AddUserPage: React.FC = () => {
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
          { label: 'rolesManagement.addUser' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="rolesManagement.addUser" />

      {/* Main Content */}
      <AddEditUser mode="add" />
    </div>
  );
};

export default AddUserPage;
