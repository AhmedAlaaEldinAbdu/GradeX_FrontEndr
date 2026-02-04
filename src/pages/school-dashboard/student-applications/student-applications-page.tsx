import React from 'react';
import RegistrationRequestsTable from './components/RegistrationRequestsTable';
import PersonalInterviewsTable from './components/PersonalInterviewsTable';

const StudentApplicationsPage: React.FC = () => {
  // TODO: Remove this temporary DEV check when the page is ready
  if (!import.meta.env.DEV) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">طلبات التقديم</h2>
        <p className="mt-4 text-gray-600">قريباً...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <RegistrationRequestsTable />
      <PersonalInterviewsTable />
    </div>
  );
};

export default StudentApplicationsPage;
