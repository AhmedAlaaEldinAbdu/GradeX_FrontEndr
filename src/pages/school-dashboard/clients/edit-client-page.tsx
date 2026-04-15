import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import ClientForm from './components/ClientForm';

export default function EditClientPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('clients.title'), path: '/financial-management/clients' },
    { label: t('actions.edit') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('actions.edit')} hasHeaderControls={false} />
      <ClientForm isEditMode={true} />
    </div>
  );
}
