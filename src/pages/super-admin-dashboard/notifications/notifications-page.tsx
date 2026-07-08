import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Notifications from './components/Notifications';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const NotificationsPage: React.FC = () => {
  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="sidebar.notifications"
        actions={[
          {
            label: 'notifications.sendNotification',
            to: 'add-notification',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
      />

      {/* Main Content */}
      <Notifications />
    </div>
  );
};

export default NotificationsPage;
