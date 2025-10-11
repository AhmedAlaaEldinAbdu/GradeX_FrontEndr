import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import EditRole from './components/EditRole';

const EditRolePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'rolesManagement.title' },
          {
            label: 'rolesManagement.rolesAndPermissions',
            path: '/super-admin/employees-administration/roles-permissions',
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
