import React from 'react';
import { useTranslation } from 'react-i18next';

const AdministratorsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-16 text-center">
      <h2 className="text-2xl font-bold text-gray-800">{t('sidebar.administrators')}</h2>
      <p className="mt-4 text-gray-600">قريباً...</p>
    </div>
  );
};

export default AdministratorsPage;
