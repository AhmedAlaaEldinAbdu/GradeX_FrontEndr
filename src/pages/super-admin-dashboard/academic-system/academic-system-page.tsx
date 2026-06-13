import React, { useState } from 'react';
import AcademicSystem from './components/AcademicSystem';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const AcademicSystemPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('AcademicSystem');

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="academicSystem.title"
        actions={
          selectedTab === 'AcademicSystem'
            ? [
                {
                  label: 'academicSystem.addAcademicSystem',
                  to: '/academic-system/add-academic-system',
                  imgSrc: PlusIcon,
                  imgClassName: `w-[24px] h-[24px]`,
                },
              ]
            : []
        }
      />

      {/* Main Content */}
      <AcademicSystem setSelectedTab={setSelectedTab} />
    </div>
  );
};

export default AcademicSystemPage;
