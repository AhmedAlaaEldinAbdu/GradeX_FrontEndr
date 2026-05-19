import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import CustomersList from './components/CustomersList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function CustomersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.financialManagement') },
    { label: t('customers.title') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="customers.title"
        hasHeaderControls={true}
        actions={[
          {
            label: 'customers.addClient',
            onClick: () => navigate('/financial-management/customers/add-client'),
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-4 h-4',
          },
        ]}
      />

      <CustomersList />
    </div>
  );
}
