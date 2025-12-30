import JobApplicantsTable from './JobApplicantsTable';
import { JOB_APPLICATION_STATUS } from './applicants-data';

type JobApplicantsRequestsProps = {
  jobAdvertisementId: string;
};

const JobApplicantsRequests = ({ jobAdvertisementId }: JobApplicantsRequestsProps) => {
  return (
    <JobApplicantsTable
      jobAdvertisementId={jobAdvertisementId}
      filterPrefix="requests"
      applicationStatus={JOB_APPLICATION_STATUS.REQUESTS}
    />
  );
};

export default JobApplicantsRequests;
