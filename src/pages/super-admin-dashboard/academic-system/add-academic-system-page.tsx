import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddAcademicSystem from './components/AddAcademicSystem';

const AddAcademicSystemPage: React.FC = () => {

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'academicSystem.title', path: '/academic-system' },
          { label: 'academicSystem.addAcademicSystem' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="academicSystem.addAcademicSystem" />

      {/* Main Content */}
      <AddAcademicSystem />
    </div>
  );
};

export default AddAcademicSystemPage;
