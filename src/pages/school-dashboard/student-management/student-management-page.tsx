import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentManagement from './components/StudentManagement';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/shared/components/PageHeader';

const StudentManagementPage: React.FC = () => {
  const { t } = useTranslation();

  // TODO: Remove this temporary DEV check when the page is ready
  if (!import.meta.env.DEV) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">الطلاب</h2>
        <p className="mt-4 text-gray-600">قريباً...</p>
      </div>
    );
  }

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
