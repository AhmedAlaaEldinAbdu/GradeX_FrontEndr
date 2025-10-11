import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import SystemUsers from './components/SystemUsers';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const SystemUsersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
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
