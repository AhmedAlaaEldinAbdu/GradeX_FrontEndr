import { useTranslation } from 'react-i18next';
import Tabs from '@/shared/components/Tabs';
import JobApplicantsRequests from './JobApplicantsRequests';
import JobApplicantsArchived from './JobApplicantsArchived';
import { JOB_APPLICANTS_TABS, type JobApplicantsTab } from '../constants';

type JobApplicantsProps = {
  selectedTab: JobApplicantsTab;
  setSelectedTab: (tab: JobApplicantsTab) => void;
  jobAdvertisementId: string;
};

const JobApplicants = ({ selectedTab, setSelectedTab, jobAdvertisementId }: JobApplicantsProps) => {
  const { t } = useTranslation();

  const tabItems = [
    {
      id: JOB_APPLICANTS_TABS.REQUESTS,
      label: t('jobAnnouncement.applicantsPage.tabs.requests'),
      content: <JobApplicantsRequests jobAdvertisementId={jobAdvertisementId} />,
    },
    {
      id: JOB_APPLICANTS_TABS.ARCHIVED,
      label: t('jobAnnouncement.applicantsPage.tabs.archived'),
      content: <JobApplicantsArchived jobAdvertisementId={jobAdvertisementId} />,
    },
  ];

  return (
    <div>
      <div className="mb-5 w-full px-1">
        <div>
          <Tabs
            items={tabItems}
            value={selectedTab}
            onChange={(id) => setSelectedTab(id as JobApplicantsTab)}
            variant="underline"
            listClassName="flex w-full md:w-[75%] lg:w-[40%] gap-2 mb-5 px-1 flex-wrap"
            lazy
            searchParamKey="applicantsTab"
          />
        </div>
      </div>
    </div>
  );
};

export default JobApplicants;
