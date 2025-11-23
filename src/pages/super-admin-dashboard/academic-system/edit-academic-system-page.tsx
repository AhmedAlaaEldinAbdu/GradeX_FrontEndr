import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import EditAcademicSystem from './components/EditAcademicSystem';

const EditAcademicSystemPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'academicSystem.title', path: '/academic-system' },
          { label: 'academicSystem.editAcademicSystem' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="academicSystem.editAcademicSystem" />

      {/* Main Content */}
      <EditAcademicSystem />
    </div>
  );
};

export default EditAcademicSystemPage;
