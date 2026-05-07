import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddJobAnnouncementForm from './components/AddJobAnnouncementForm';

export default function EditJobAnnouncementPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.teachingStaff') },
    { label: t('sidebar.jobAnnouncements') },
    { label: t('jobAnnouncement.editAnnouncement') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="jobAnnouncement.editAnnouncement" />

      <AddJobAnnouncementForm jobId={id} />
    </div>
  );
}
