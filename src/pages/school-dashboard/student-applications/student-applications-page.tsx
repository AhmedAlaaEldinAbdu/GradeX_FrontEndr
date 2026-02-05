import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Tabs from '@/shared/components/Tabs';
import RegistrationRequestsTable from './components/RegistrationRequestsTable';
import PersonalInterviewsTable from './components/PersonalInterviewsTable';

const StudentApplicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'applications');

  // TODO: Remove this temporary DEV check when the page is ready
  if (!import.meta.env.DEV) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">طلبات التقديم</h2>
        <p className="mt-4 text-gray-600">قريباً...</p>
      </div>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const breadcrumbItems = [
    { label: t('sidebar.studentManagement') },
    { label: t('studentApplications.title') },
  ];

  const tabs = [
    {
      id: 'applications',
      label: t('studentApplications.title'),
      content: activeTab === 'applications' ? <RegistrationRequestsTable /> : null,
    },
    {
      id: 'interviews',
      label: t('studentApplications.interviewsTitle'),
      content: activeTab === 'interviews' ? <PersonalInterviewsTable /> : null,
    },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title={
          activeTab === 'applications'
            ? 'studentApplications.title'
            : 'studentApplications.interviewsTitle'
        }
      />

      <div className="p-6 pt-0">
        <div className="mb-5 w-full px-1">
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={handleTabChange}
            variant="underline"
            listClassName="flex w-[100%] md:w-[75%] lg:w-[40%] gap-2 mb-5 px-1 flex-wrap"
            lazy={true}
            searchParamKey="tab"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationsPage;
