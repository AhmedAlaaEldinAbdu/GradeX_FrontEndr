import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import RolesPermissions from './components/RolesPermissions';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddRole from './components/AddRole';

const AddRolePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "rolesManagement.title"},
          { label: "rolesManagement.rolesAndPermissions", path: '/super-admin/employees-administration/roles-permissions' },
          { label: "rolesManagement.addRole"},
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title="rolesManagement.addRole"
      />

      {/* Main Content */}
      <AddRole />
    </div>
  );
};

export default AddRolePage;
