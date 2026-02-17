import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentManagement from './components/StudentManagement';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/shared/components/PageHeader';

const StudentManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('sidebar.studentManagement') },
          { label: t('studentManagement.students') },
        ]}
      />

      {/* Page Header */}
      <PageHeader title={t('studentManagement.students')} />

      {/* Main Content */}
      <StudentManagement />
    </div>
  );
};

export default StudentManagementPage;
