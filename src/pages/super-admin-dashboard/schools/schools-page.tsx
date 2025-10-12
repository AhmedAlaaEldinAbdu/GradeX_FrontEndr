import React from 'react';
import StudentManagement from './components/Schools';
import PageHeader from '@gradex/shared/components/PageHeader';

const SchoolsPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      {/* <Breadcrumb
        items={[
          { label: "schools.title"},
        ]}
      /> */}

      {/* Page Header */}
      <PageHeader
        title="schools.title"
        actions={[{ label: 'schools.addSchool', to: '/schools/add-school' }]}
      />

      {/* Main Content */}
      <StudentManagement />
    </div>
  );
};

export default SchoolsPage;
