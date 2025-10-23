import React from 'react';
import PageHeader from '@/shared/components/PageHeader';
import CountryHolidays from './components/CountryHolidays';

const CountryHolidaysPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Page Header */}
      <PageHeader title="officialHolidays.countryHolidays" />

      {/* Main Content */}
      <CountryHolidays />
    </div>
  );
};

export default CountryHolidaysPage;
