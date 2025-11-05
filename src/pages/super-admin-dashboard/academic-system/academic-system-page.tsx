import React, { useState } from 'react';
import AcademicSystem from './components/AcademicSystem';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const AcademicSystemPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('AcademicSystem');

  return (
    <div dir="rtl">
      {/* Page Header */}
      <PageHeader
        title="academicSystem.title"
        actions={
          selectedTab === 'AcademicSystem'
            ? [
                {
                  label: 'academicSystem.addAcademicSystem',
                  // to: '/academic-system/add-academic-system',
                  to: '#!',
                  imgSrc: PlusIcon,
                  imgClassName: `w-[24px] h-[24px]`,
                },
              ]
            : [
                {
                  label: 'academicSystem.addEducationalStages',
                  // to: '/academic-system/add-educational-stages',
                  to: '#!',
                  imgSrc: PlusIcon,
                  imgClassName: `w-[24px] h-[24px]`,
                },
              ]
        }
      />

      {/* Main Content */}
      <AcademicSystem setSelectedTab={setSelectedTab} />
    </div>
  );
};

export default AcademicSystemPage;
