import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import JobAnnouncementsList from './components/JobAnnouncementsList';

export default function JobAnnouncementsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.teachingStaff') },
    { label: t('sidebar.jobAnnouncements') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="jobAnnouncement.title"
        actions={[
          {
            label: 'jobAnnouncement.addAnnouncement',
            to: '/job-announcements/add-job-announcements',
            imgSrc: PlusIcon,
            imgClassName: 'w-[24px] h-[24px]',
          },
        ]}
      />

      <JobAnnouncementsList />
    </div>
  );
}
