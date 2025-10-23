import React from 'react';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import OfficialHolidays from './components/OfficialHolidays';

const OfficialHolidaysPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Page Header */}
      <PageHeader
        title="sidebar.officialHolidays"
        actions={[
          {
            label: 'officialHolidays.addHoliday',
            to: 'add-holiday',
            imgSrc: PlusIcon,
            imgClassName: `w-[24px] h-[24px]`,
          },
        ]}
      />

      {/* Main Content */}
      <OfficialHolidays />
    </div>
  );
};

export default OfficialHolidaysPage;
