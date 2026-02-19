import React from 'react';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import RegistrationAnnouncement from './components/RegistrationAnnouncement';
import { useTranslation } from 'react-i18next';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import PageHeader from '@/shared/components/PageHeader';

const RegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('registrationAnnouncement.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

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
