import { useTranslation } from 'react-i18next';

import PageHeader from '@/shared/components/PageHeader';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import EditEarlyLeaveRequestForm from './components/EditEarlyLeaveRequestForm';

export default function EditEarlyLeaveRequestPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.studentAffairs') },
    { label: t('requests.title'), path: '/requests?tab=early-leave' },
    { label: t('requests.earlyLeave.editTitle') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="requests.earlyLeave.editTitle" />
      <EditEarlyLeaveRequestForm />
    </div>
  );
}
