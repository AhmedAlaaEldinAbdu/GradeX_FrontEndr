import JobApplicantsTable from './JobApplicantsTable';
import { ARCHIVED_APPLICATIONS } from './applicants-data';

const JobApplicantsArchived = () => {
  return <JobApplicantsTable data={ARCHIVED_APPLICATIONS} filterPrefix="archived" isArchived />;
};

export default JobApplicantsArchived;
