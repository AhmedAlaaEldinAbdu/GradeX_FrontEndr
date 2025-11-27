import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import EditRole from './components/EditRole';

const EditRolePage: React.FC = () => {
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
          { label: 'rolesManagement.editRole' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="rolesManagement.editRole" />

      {/* Main Content */}
      <EditRole />
    </div>
  );
};

export default EditRolePage;
