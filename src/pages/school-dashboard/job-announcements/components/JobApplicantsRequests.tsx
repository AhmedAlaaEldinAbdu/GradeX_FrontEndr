import JobApplicantsTable from './JobApplicantsTable';
import { APPLICATION_REQUESTS } from './applicants-data';

const JobApplicantsRequests = () => {
  return <JobApplicantsTable data={APPLICATION_REQUESTS} filterPrefix="requests" />;
};

export default JobApplicantsRequests;
