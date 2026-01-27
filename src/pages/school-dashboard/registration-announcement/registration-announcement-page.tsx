import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import { Button } from '@gradex/shared/components/components';
import RegistrationAnnouncement from './components/RegistrationAnnouncement';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

const RegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // TODO: Remove this temporary DEV check when the page is ready
  if (!import.meta.env.DEV) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">إعلان التسجيل</h2>
        <p className="mt-4 text-gray-600">قريباً...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: t('registrationAnnouncement.title') }]} />

      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{t('registrationAnnouncement.title')}</h1>
        <Button
          icon={<span className="text-lg">+</span>}
          onClick={() => navigate('/registration-announcement/add-registration-announcement')}
        >
          {t('registrationAnnouncement.addAnnouncement')}
        </Button>
      </div>

      {/* Main Content */}
      <RegistrationAnnouncement />
    </div>
  );
};

export default RegistrationAnnouncementPage;
