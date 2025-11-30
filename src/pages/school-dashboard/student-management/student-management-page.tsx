import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import { Button } from '@gradex/shared/components/components';
import StudentManagement from './components/StudentManagement';
import { useTranslation } from 'react-i18next';

const StudentManagementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: t('studentManagement.students') }]} />

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">الطلاب</h1>
        <Button icon={<span className="text-lg">+</span>}>إضافة طالب</Button>
      </div>

      {/* Main Content */}
      <StudentManagement />
    </div>
  );
};

export default StudentManagementPage;
