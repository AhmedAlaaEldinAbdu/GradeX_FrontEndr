import React from 'react';
import RegistrationAnnouncement from './components/RegistrationAnnouncement';
import { useTranslation } from 'react-i18next';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import PageHeader from '@/shared/components/PageHeader';
import Breadcrumb from '@/shared/layout/Breadcrumb';

const RegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('sidebar.studentAffairs') },
          { label: t('sidebar.studentManagement') },
          { label: t('registrationAnnouncement.title') },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title={'registrationAnnouncement.title'}
        actions={[
          {
            label: t('registrationAnnouncement.addAnnouncement'),
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
            to: '/registration-announcement/add-registration-announcement',
          },
        ]}
        hasHeaderControls={true}
      />

      {/* Main Content */}
      <RegistrationAnnouncement />
    </div>
  );
};

export default RegistrationAnnouncementPage;
