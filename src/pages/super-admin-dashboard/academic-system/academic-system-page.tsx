import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import { Button } from '@gradex/shared/components/components';
import AcademicSystem from './components/AcademicSystem';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const AcademicSystemPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div dir="rtl">

      {/* Page Header */}
      <PageHeader
        title="academicSystem.title"
        actions={[
          {
            label: 'academicSystem.addAcademicSystem',
            to: '/academic-system/add-academic-system',
            imgSrc: PlusIcon,
            imgClassName: `w-[24px] h-[24px]`,
          },
          {
            label: 'academicSystem.addEducationalStages',
            to: '/academic-system/add-educational-stages',
            imgSrc: PlusIcon,
            imgClassName: `w-[24px] h-[24px]`,
          },
        ]}
      />

      {/* Main Content */}
      <AcademicSystem />
    </div>
  );
};

export default AcademicSystemPage;
