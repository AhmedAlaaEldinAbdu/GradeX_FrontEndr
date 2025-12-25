import { useState } from 'react';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import JobApplicants, {
  JOB_APPLICANTS_TABS,
  type JobApplicantsTab,
} from './components/JobApplicants';

const JobAnnouncementDetailsPage = () => {
  const [selectedTab, setSelectedTab] = useState<JobApplicantsTab>(JOB_APPLICANTS_TABS.REQUESTS);

  const breadcrumbItems = [
    { label: 'sidebar.teachingStaff', path: '/job-announcements' },
    { label: 'sidebar.jobAnnouncements', path: '/job-announcements' },
    { label: 'jobAnnouncement.applicantsPage.breadcrumb' },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="jobAnnouncement.applicantsPage.title"
        actions={[
          {
            label: 'jobAnnouncement.backToAnnouncements',
            to: '/job-announcements',
            variant: 'secondary',
          },
        ]}
      />

      <JobApplicants selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
    </div>
  );
};

export default JobAnnouncementDetailsPage;
