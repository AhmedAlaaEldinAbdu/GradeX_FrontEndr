import React from 'react';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';

import AddMessage from './components/AddMessage';

const breadcrumbItems = [
  { label: 'sidebar.studentManagement' },
  { label: 'requests.title', path: '/requests' },
  { label: 'requests.addMessage.title' },
];

const AddMessagePage: React.FC = () => {
  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader title="requests.addMessage.title" />

      <AddMessage />
    </div>
  );
};

export default AddMessagePage;
