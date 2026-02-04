import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import RegistrationAnnouncementForm from './components/RegistrationAnnouncementForm';
import { useNavigate, useParams } from 'react-router-dom';
import { type RegistrationAnnouncementProps } from '@/validations/registration-announcement-validations';

const EditRegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<Partial<RegistrationAnnouncementProps> | null>(
    null
  );

  useEffect(() => {
    // TODO: Fetch data by ID
    // Simulating fetch
    if (id) {
      // Mock data depending on ID if needed, or just static for now
      setInitialValues({
        educationalStages: 'primary', // This needs to match how the multiselect expects values (likely comma separated or array depending on implementation)
        startDate: '2025-02-22',
        endDate: '2025-02-22',
      });
    }
  }, [id]);

  const handleEditSubmit = async (data: RegistrationAnnouncementProps) => {
    // TODO: Implement submission logic (API call)
    console.log('Updated Form Data:', data);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate('/registration-announcement');
  };

  if (!initialValues) {
    return <div>{t('common.loading')}...</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('registrationAnnouncement.title'), path: '/registration-announcement' },
          { label: t('registrationAnnouncement.editPageTitle') }, // Make sure to add this key to translations or use a temporary string
        ]}
      />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-start text-2xl font-bold text-gray-800">
          {t('registrationAnnouncement.editPageTitle')}
        </h1>
      </div>

      {/* Main Content */}
      <RegistrationAnnouncementForm
        onSubmit={handleEditSubmit}
        initialValues={initialValues}
        isEditMode
      />
    </div>
  );
};

export default EditRegistrationAnnouncementPage;
