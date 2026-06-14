import React from 'react';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';

import ViewMessage from './components/ViewMessage';

const breadcrumbItems = [
  { label: 'sidebar.studentManagement' },
  { label: 'requests.title', path: '/requests' },
  { label: 'requests.viewMessage.title' },
];

const ViewMessagePage: React.FC = () => {
  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="requests.viewMessage.title" />

      <ViewMessage />
    </div>
  );
};

export default ViewMessagePage;
