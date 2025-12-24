import { useTranslation } from 'react-i18next';
import Tabs from '@/shared/components/Tabs';
import JobApplicantsRequests from './JobApplicantsRequests';
import JobApplicantsArchived from './JobApplicantsArchived';

export const JOB_APPLICANTS_TABS = {
  REQUESTS: 'requests',
  ARCHIVED: 'archived',
} as const;

export type JobApplicantsTab = (typeof JOB_APPLICANTS_TABS)[keyof typeof JOB_APPLICANTS_TABS];

type JobApplicantsProps = {
  selectedTab: JobApplicantsTab;
  setSelectedTab: (tab: JobApplicantsTab) => void;
};

const JobApplicants = ({ selectedTab, setSelectedTab }: JobApplicantsProps) => {
  const { t } = useTranslation();

  const tabItems = [
    {
      id: JOB_APPLICANTS_TABS.REQUESTS,
      label: t('jobAnnouncement.applicantsPage.tabs.requests'),
      content: <JobApplicantsRequests />,
    },
    {
      id: JOB_APPLICANTS_TABS.ARCHIVED,
      label: t('jobAnnouncement.applicantsPage.tabs.archived'),
      content: <JobApplicantsArchived />,
    },
  ];

  return (
    <div className="mt-6">
      <Tabs
        items={tabItems}
        value={selectedTab}
        onChange={(id) => setSelectedTab(id as JobApplicantsTab)}
        variant="underline"
        lazy
        searchParamKey="applicantsTab"
      />
    </div>
  );
};

export default JobApplicants;
