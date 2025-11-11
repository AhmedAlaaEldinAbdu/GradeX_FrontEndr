import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import EditEducationalStages from './components/EditEducationalStages';

const EditEducationalStagesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'academicSystem.title', path: '/academic-system' },
          { label: 'academicSystem.editEducationalStages' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="academicSystem.editEducationalStages" />

      {/* Main Content */}
      <EditEducationalStages />
    </div>
  );
};

export default EditEducationalStagesPage;
