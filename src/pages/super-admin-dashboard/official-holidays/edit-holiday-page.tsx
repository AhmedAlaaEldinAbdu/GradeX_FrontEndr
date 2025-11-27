import { useAppSelector } from '@/hooks/useRedux';
import EditHolidayForm from './components/EditHolidayForm';
import PageHeader from '@/shared/components/PageHeader';
import { Breadcrumb } from '@/shared/layout/layout';
import { useTranslation } from 'react-i18next';

const EditHolidayPage = () => {
  const { i18n } = useTranslation();
  const holiday = useAppSelector((state) => state.officialHolidays.selectedHoliday);

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'officialHolidays.holidays', path: '/official-holidays' },
          {
            label: holiday
              ? i18n.language === 'ar'
                ? holiday.countryNameAR
                : holiday.countryNameEN
              : '',
            path: `/official-holidays/country/${holiday?.lkCountryId}`,
          },
          { label: 'officialHolidays.editHoliday' },
        ]}
      />
      {/* Page Header */}
      <PageHeader title="officialHolidays.editHoliday" />

      {/* Main Content */}

      <EditHolidayForm />
    </div>
  );
};

export default EditHolidayPage;
