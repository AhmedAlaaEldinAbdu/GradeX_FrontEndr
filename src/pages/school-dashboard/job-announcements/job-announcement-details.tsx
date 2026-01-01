import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import JobApplicants from './components/JobApplicants';
import { JOB_APPLICANTS_TABS, type JobApplicantsTab } from './constants';

const JobAnnouncementDetailsPage = () => {
  const [selectedTab, setSelectedTab] = useState<JobApplicantsTab>(JOB_APPLICANTS_TABS.REQUESTS);
  const { jobId = '' } = useParams<{ jobId: string }>();

  const breadcrumbItems = [
    { label: 'sidebar.teachingStaff' },
    { label: 'sidebar.jobAnnouncements', path: '/job-announcements' },
    { label: 'jobAnnouncement.applicantsPage.breadcrumb' },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="jobAnnouncement.applicantsPage.title" />

      <JobApplicants
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        jobAdvertisementId={jobId}
      />
    </div>
  );
};

export default JobAnnouncementDetailsPage;
