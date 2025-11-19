import React from 'react';
import Schools from './components/Schools';
import PageHeader from '@gradex/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

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
        actions={[
          {
            label: 'schools.addSchool',
            to: '/schools/add-school',
            imgSrc: PlusIcon,
            imgClassName: `w-[24px] h-[24px]`,
          },
        ]}
      />

      {/* Main Content */}
      <Schools />
    </div>
  );
};

export default SchoolsPage;
