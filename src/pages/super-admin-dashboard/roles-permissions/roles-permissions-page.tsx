import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import RolesPermissions from './components/RolesPermissions';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const RolesPermissionsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'rolesManagement.title' },
          { label: 'rolesManagement.rolesAndPermissions' },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title="rolesManagement.rolesAndPermissions"
        actions={[
          {
            label: 'rolesManagement.addRole',
            to: 'add-role',
            imgSrc: PlusIcon,
            imgClassName: `w-[24px] h-[24px]`,
          },
        ]}
      />

      {/* Main Content */}
      <RolesPermissions />
    </div>
  );
};

export default RolesPermissionsPage;
