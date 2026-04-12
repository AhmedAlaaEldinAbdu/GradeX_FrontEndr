import React from 'react';
import RegistrationAnnouncement from './components/RegistrationAnnouncement';
import { useTranslation } from 'react-i18next';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import PageHeader from '@/shared/components/PageHeader';

const RegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
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
      />

      {/* Main Content */}
      <RegistrationAnnouncement />
    </div>
  );
};

export default RegistrationAnnouncementPage;
