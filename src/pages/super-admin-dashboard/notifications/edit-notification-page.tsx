import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Breadcrumb from '@gradex/shared/layout/Breadcrumb';
import EditNotification from './components/EditNotification';

const EditNotificationPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'sidebar.notifications', path: '/notifications' },
          { label: 'notifications.editNotification' },
        ]}
      />

      {/* Page Header */}
      <PageHeader title="notifications.editNotification" />

      {/* Main Content */}
      <EditNotification />
    </div>
  );
};

export default EditNotificationPage;
