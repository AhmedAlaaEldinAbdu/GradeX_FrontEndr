import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import EditEducationalStages from './components/EditEducationalStages';

const EditEducationalStagesPage: React.FC = () => {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'academicSystem.title', path: '/academic-system' },
          { label: 'academicSystem.editEducationalStage' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="academicSystem.editEducationalStage" />

      {/* Main Content */}
      <EditEducationalStages />
    </div>
  );
};

export default EditEducationalStagesPage;
