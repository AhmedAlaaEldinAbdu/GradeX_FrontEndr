import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import { Button } from '@gradex/shared/components/components';
import RegistrationAnnouncement from './components/RegistrationAnnouncement';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

const RegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
