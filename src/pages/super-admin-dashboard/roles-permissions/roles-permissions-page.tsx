import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import RolesPermissions from './components/RolesPermissions';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';

const RolesPermissionsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "rolesManagement.title"},
          { label: "rolesManagement.rolesAndPermissions"},
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title="rolesManagement.rolesAndPermissions"
        actions={[{ label: 'rolesManagement.addRole', to: 'add-role' }]}
      />

      {/* Main Content */}
      <RolesPermissions />
    </div>
  );
};

export default RolesPermissionsPage;
