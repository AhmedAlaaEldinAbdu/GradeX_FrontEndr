import React from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import AddRegistrationAnnouncementForm from './components/AddRegistrationAnnouncementForm';

const AddRegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('registrationAnnouncement.title'), path: '/registration-announcement' },
          { label: t('registrationAnnouncement.addPageTitle') },
        ]}
      />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-start text-2xl font-bold text-gray-800">
          {t('registrationAnnouncement.addPageTitle')}
        </h1>
      </div>

      {/* Main Content */}
      <AddRegistrationAnnouncementForm />
    </div>
  );
};

export default AddRegistrationAnnouncementPage;
