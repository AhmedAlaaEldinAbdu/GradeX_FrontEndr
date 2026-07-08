import React from 'react';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import OfficialHolidays from './components/OfficialHolidays';

const OfficialHolidaysPage: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="officialHolidays.holidays"
        actions={[
          {
            label: 'officialHolidays.addHoliday',
            to: 'add-holiday',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
      />

      {/* Main Content */}
      <OfficialHolidays />
    </div>
  );
};

export default OfficialHolidaysPage;
