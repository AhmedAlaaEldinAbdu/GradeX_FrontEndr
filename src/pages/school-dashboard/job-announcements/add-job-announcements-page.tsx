import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddJobAnnouncementForm from './components/AddJobAnnouncementForm';

export default function AddJobAnnouncementsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.teachingStaff') },
    { label: t('sidebar.jobAnnouncements') },
    { label: t('jobAnnouncement.addAnnouncement') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="jobAnnouncement.addAnnouncement" />

      <AddJobAnnouncementForm />
    </div>
  );
}
