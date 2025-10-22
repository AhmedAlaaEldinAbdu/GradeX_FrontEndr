import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddEducationalStages from './components/AddEducationalStages';

const AddEducationalStagesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'academicSystem.title', path: '/academic-system' },
          { label: 'academicSystem.addEducationalStages' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="academicSystem.addEducationalStages" />

      {/* Main Content */}
      <AddEducationalStages />
    </div>
  );
};

export default AddEducationalStagesPage;
