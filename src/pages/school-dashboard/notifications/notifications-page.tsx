import { useSearchParams } from 'react-router-dom';

import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Notifications from './components/Notifications';

export default function NotificationsPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');
  const addNotificationPath =
    activeTab === 'parents'
      ? '/settings/notifications/parents/add'
      : '/settings/notifications/employees/add';

  const breadcrumbItems = [
    { label: 'sidebar.systemSettings' },
    { label: 'sidebar.settings' },
    { label: 'sidebar.notifications' },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="sidebar.notifications"
        actions={[
          {
            label: 'notifications.addNotification',
            to: addNotificationPath,
            imgClassName: 'w-10 h-10',
            circle: true,
          },
        ]}
        hasHeaderControls={true}
      />

      <Notifications />
    </div>
  );
}
