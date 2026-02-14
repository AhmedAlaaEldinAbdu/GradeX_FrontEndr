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
