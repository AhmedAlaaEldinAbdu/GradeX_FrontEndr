import React from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import RegistrationAnnouncementForm from './components/RegistrationAnnouncementForm';
import PageHeader from '@/shared/components/PageHeader';

const AddRegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('sidebar.studentAffairs') },
          { label: t('sidebar.studentManagement') },
          { label: t('registrationAnnouncement.title'), path: '/registration-announcement' },
          { label: t('registrationAnnouncement.addPageTitle') },
        ]}
      />

      {/* Page Header */}
      <PageHeader title={'registrationAnnouncement.addPageTitle'} />

      {/* Main Content */}
      <RegistrationAnnouncementForm />
    </div>
  );
};

export default AddRegistrationAnnouncementPage;
