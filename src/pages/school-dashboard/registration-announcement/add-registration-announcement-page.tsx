import React from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import RegistrationAnnouncementForm from './components/RegistrationAnnouncementForm';
import { useNavigate } from 'react-router-dom';
import { type RegistrationAnnouncementProps } from '@/validations/registration-announcement-validations';

const AddRegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleAddSubmit = async (data: RegistrationAnnouncementProps) => {
    // TODO: Implement submission logic (API call)
    console.log('Form Data:', data);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate('/registration-announcement');
  };

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
      <RegistrationAnnouncementForm onSubmit={handleAddSubmit} />
    </div>
  );
};

export default AddRegistrationAnnouncementPage;
