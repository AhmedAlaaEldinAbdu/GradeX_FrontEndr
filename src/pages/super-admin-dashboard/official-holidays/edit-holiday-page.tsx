import { useTranslation } from 'react-i18next';
import EditHolidayForm from './components/EditHolidayForm';

const EditHolidayPage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('officialHolidays.editHoliday')}
        </h1>
      </div>

      <EditHolidayForm />
    </div>
  );
};

export default EditHolidayPage;
