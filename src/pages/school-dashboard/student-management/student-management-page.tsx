import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import StudentManagement from './components/StudentManagement';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/shared/components/PageHeader';
import { useAppSelector } from '@/hooks/useRedux';

const StudentManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const totalStudents = useAppSelector((state) => state.students.pagination.totalItems);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('sidebar.studentAffairs') },
          { label: t('sidebar.studentManagement') },
          { label: t('studentManagement.studentsRecord') },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title={t('studentManagement.studentsRecord')}
        hasHeaderControls={true}
        statistics={{ value: totalStudents, label: 'grades.studentPlural' }}
      />

      {/* Main Content */}
      <StudentManagement />
    </div>
  );
};

export default StudentManagementPage;
