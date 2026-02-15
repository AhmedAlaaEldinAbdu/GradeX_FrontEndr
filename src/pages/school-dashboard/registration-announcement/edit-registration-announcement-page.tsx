import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Breadcrumb } from '@gradex/shared/layout/layout';
import RegistrationAnnouncementForm from './components/RegistrationAnnouncementForm';
import { useParams } from 'react-router-dom';
import { type RegistrationAnnouncementProps } from '@/validations/registration-announcement-validations';
import { registrationAnnouncementApi } from '@/services/api/registration-announcement/registration-announcement.service';
import Loading from '@/shared/components/Loading';

const EditRegistrationAnnouncementPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<Partial<RegistrationAnnouncementProps> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await registrationAnnouncementApi.getById(id);
        if (response.isSuccess && response.data && response.data.registrationAdvertisementDto) {
          // Find the announcement with the matching ID, or take the first one if exact match is expected
          const announcement =
            response.data.registrationAdvertisementDto.find((item: any) => item.id === id) ||
            response.data.registrationAdvertisementDto[0];

          if (!announcement) {
            setError(t('common.noDataFound'));
            setIsLoading(false);
            return;
          }

          const formatDateTime = (dateString: string) => {
            if (!dateString) return '';
            try {
              // Extract "YYYY-MM-DDThh:mm" safely
              const formatted = new Date(dateString).toISOString().slice(0, 16);
              return formatted;
            } catch {
              return '';
            }
          };

          const values = {
            lkSchoolStageId: announcement.lkSchoolStageId,
            startDate: formatDateTime(announcement.startDate),
            endDate: formatDateTime(announcement.endDate),
          };

          setInitialValues(values);
        } else {
          setError(response.message || t('common.errorOccurred'));
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
        setError(t('common.errorOccurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id, t]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (!initialValues) {
    return <div className="p-8 text-center text-gray-500">{t('common.noDataFound')}</div>;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('registrationAnnouncement.title'), path: '/registration-announcement' },
          { label: t('registrationAnnouncement.editPageTitle') },
        ]}
      />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-start text-2xl font-bold text-gray-800">
          {t('registrationAnnouncement.editPageTitle')}
        </h1>
      </div>

      {/* Main Content */}
      <RegistrationAnnouncementForm initialValues={initialValues} isEditMode registrationId={id} />
    </div>
  );
};

export default EditRegistrationAnnouncementPage;
