import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import NotFoundMessage from '@/shared/components/NotFoundMessage';
import JobApplicationDetailsContent from './components/JobApplicationDetailsContent';
import { findJobApplicationById } from './admin-requests.mock';

const JobApplicationDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const application = id ? findJobApplicationById(id) : undefined;

  const breadcrumbItems = [
    { label: t('sidebar.humanResources') },
    { label: t('sidebar.adminRequests'), path: '/admin-requests' },
    { label: t('adminRequests.jobApplication.detailsTitle') },
  ];

  return (
    <div className="pb-6">
      <Breadcrumb items={breadcrumbItems} />

      {application ? (
        <JobApplicationDetailsContent application={application} />
      ) : (
        <NotFoundMessage message="adminRequests.empty" />
      )}
    </div>
  );
};

export default JobApplicationDetailsPage;
