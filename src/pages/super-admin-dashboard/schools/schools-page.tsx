import React from 'react';
import { useTranslation } from 'react-i18next';
import StudentManagement from './components/Schools';
import PageHeader from '@gradex/shared/components/PageHeader';

const SchoolsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      {/* <Breadcrumb
        items={[
          { label: "schools.title"},
        ]}
      /> */}

      {/* Page Header */}
      <PageHeader title='schools.title' actions={[{label: "schools.addSchool", to: '/Schools/add-School'}]} />

      {/* Main Content */}
      <StudentManagement />
    </div>
  );
};

export default SchoolsPage;
