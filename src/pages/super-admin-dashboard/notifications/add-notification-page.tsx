import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import AddNotification from './components/AddNotification';

const AddNotificationPage: React.FC = () => {
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'sidebar.notifications', path: '/notifications' },
          { label: 'notifications.addNotification' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="notifications.addNotification" />

      {/* Main Content */}
      <AddNotification />
    </div>
  );
};

export default AddNotificationPage;
