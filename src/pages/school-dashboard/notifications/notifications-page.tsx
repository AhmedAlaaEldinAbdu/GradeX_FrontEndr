import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import Notifications from './components/Notifications';

export default function NotificationsPage() {
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
            onClick: () => undefined,
            imgSrc: PlusIcon,
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
