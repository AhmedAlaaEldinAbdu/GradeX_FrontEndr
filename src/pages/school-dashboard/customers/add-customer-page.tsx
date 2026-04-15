import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import CustomerForm from './components/CustomerForm';

export default function AddCustomerPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('customers.title'), path: '/financial-management/customers' },
    { label: t('customers.addClient') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('customers.addClient')} hasHeaderControls={false} />
      <CustomerForm />
    </div>
  );
}
