import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import CustomerForm from './components/CustomerForm';

export default function EditCustomerPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('customers.title'), path: '/financial-management/customers' },
    { label: t('actions.edit') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('actions.edit')} hasHeaderControls={false} />
      <CustomerForm isEditMode={true} />
    </div>
  );
}
