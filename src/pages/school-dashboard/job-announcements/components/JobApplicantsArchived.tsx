import JobApplicantsTable from './JobApplicantsTable';
import { JOB_APPLICATION_STATUS } from './applicants-data';

type JobApplicantsArchivedProps = {
  jobAdvertisementId: string;
};

const JobApplicantsArchived = ({ jobAdvertisementId }: JobApplicantsArchivedProps) => {
  return (
    <JobApplicantsTable
      jobAdvertisementId={jobAdvertisementId}
      filterPrefix="archived"
      isArchived
      applicationStatus={JOB_APPLICATION_STATUS.ARCHIVED}
    />
  );
};

export default JobApplicantsArchived;
