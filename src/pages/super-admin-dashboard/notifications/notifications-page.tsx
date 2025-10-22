import React from 'react';
import PageHeader from '@gradex/shared/components/PageHeader';
import Notifications from './components/Notifications';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

const NotificationsPage: React.FC = () => {
  return (
    <div dir="rtl">
      {/* Page Header */}
      <PageHeader
        title="sidebar.notifications"
        actions={[
          {
            label: 'notifications.sendNotification',
            to: 'add-notification',
            imgSrc: PlusIcon,
            imgClassName: `w-[24px] h-[24px]`,
          },
        ]}
      />

      {/* Main Content */}
      <Notifications />
    </div>
  );
};

export default NotificationsPage;
