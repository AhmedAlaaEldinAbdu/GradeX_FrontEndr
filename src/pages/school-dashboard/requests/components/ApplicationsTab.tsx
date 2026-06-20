import React from 'react';
import PageHeader from '@/shared/components/PageHeader';
import { useAppSelector } from '@/hooks/useRedux';
import RegistrationRequestsTable from './RegistrationRequestsTable';
import PersonalInterviewsTable from './PersonalInterviewsTable';

/**
 * "طلبات التقديم" tab — reuses the Student Applications page content
 * (registration requests + personal interviews tables, which self-fetch).
 */
const ApplicationsTab: React.FC = () => {
  const interviewsPagination = useAppSelector((state) => state.studentInterviews.pagination);

  return (
    <div>
      <PageHeader title="requests.tabs.applications" hasHeaderControls={true} />
      <div className="mb-8">
        <RegistrationRequestsTable />
      </div>

      <PageHeader
        title="studentApplications.interviewsTitle"
        hasHeaderControls={true}
        statistics={{
          value: interviewsPagination.totalItems,
          label: 'studentApplications.interviewsCount',
        }}
      />
      <PersonalInterviewsTable />
    </div>
  );
};

export default ApplicationsTab;
