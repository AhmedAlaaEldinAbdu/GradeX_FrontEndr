import React from 'react';
import PageHeader from '@/shared/components/PageHeader';
import AddHolidayForm from './components/AddHolidayForm';

const AddHolidayPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Page Header */}
      <PageHeader title="officialHolidays.addTheHoliday" />

      {/* Main Content */}
      <AddHolidayForm />
    </div>
  );
};

export default AddHolidayPage;
