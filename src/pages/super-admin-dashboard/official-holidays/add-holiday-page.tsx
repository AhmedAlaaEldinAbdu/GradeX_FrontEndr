import React from 'react';
import PageHeader from '@/shared/components/PageHeader';
import AddHolidayForm from './components/AddHolidayForm';
import { Breadcrumb } from '@/shared/layout/layout copy';

const AddHolidayPage: React.FC = () => {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'officialHolidays.holidays', path: '/official-holidays' },
          { label: 'officialHolidays.addTheHoliday' },
        ]}
      />
      {/* Page Header */}
      <PageHeader title="officialHolidays.addTheHoliday" />

      {/* Main Content */}
      <AddHolidayForm />
    </div>
  );
};

export default AddHolidayPage;
