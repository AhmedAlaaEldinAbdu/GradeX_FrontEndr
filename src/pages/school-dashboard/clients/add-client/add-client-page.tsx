import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import AddClientForm from './components/AddClientForm';

export default function AddClientPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('clients.title'), path: '/financial-management/clients' },
    { label: 'إضافة عميل' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="إضافة عميل" />
      <AddClientForm onCancel={() => navigate('/financial-management/clients')} />
    </div>
  );
}
