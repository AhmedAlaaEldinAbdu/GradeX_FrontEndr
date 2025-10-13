import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddUser from './components/AddUser';

const AddUserPage: React.FC = () => {
  const { t } = useTranslation();

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
          { label: 'rolesManagement.addUser' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="rolesManagement.addUser" />

      {/* Main Content */}
      <AddUser />
    </div>
  );
};

export default AddUserPage;
