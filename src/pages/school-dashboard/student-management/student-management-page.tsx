import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentManagement from './components/StudentManagement';
import { useTranslation } from 'react-i18next';

const StudentManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: t('studentManagement.students') }]} />

      {/* Main Content */}
      <StudentManagement />

      {/* <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">الطلاب</h2>
        <p className="mt-4 text-gray-600">قريباً...</p>
      </div> */}
    </div>
  );
};

export default StudentManagementPage;
