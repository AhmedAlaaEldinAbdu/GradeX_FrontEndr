import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import CustomerDetails from './components/CustomerDetails';

export default function CustomerDetailsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.financialManagement') },
    { label: t('customers.title'), path: '/financial-management/customers' },
    { label: t('customers.viewClient') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('customers.viewClient')} hasHeaderControls={false} />
      <CustomerDetails />
    </div>
  );
}
