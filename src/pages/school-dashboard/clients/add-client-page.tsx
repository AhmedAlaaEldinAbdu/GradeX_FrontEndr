import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import ClientForm from './components/ClientForm';

export default function AddClientPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('clients.title'), path: '/financial-management/clients' },
    { label: 'إضافة عميل' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="إضافة عميل" />
      <ClientForm />
    </div>
  );
}
