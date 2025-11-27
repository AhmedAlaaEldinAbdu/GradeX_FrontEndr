import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddRole from './components/AddRole';

const AddRolePage: React.FC = () => {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'rolesManagement.title' },
          {
            label: 'rolesManagement.rolesAndPermissions',
            path: '/employees-administration/roles-permissions',
          },
          { label: 'rolesManagement.addRole' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="rolesManagement.addRole" />

      {/* Main Content */}
      <AddRole />
    </div>
  );
};

export default AddRolePage;
