import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import EditClientForm from './components/EditClientForm';

export default function EditClientPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('clients.title'), path: '/financial-management/clients' },
    { label: t('actions.edit') },
  ];

  // TODO: fetch client data by id and pass as initialData
  const initialData = {
    clientName: 'أحمد حسن محمد',
    clientType: 'company' as const,
    idNumber: '123456789012',
    email: 'ahmed@gmail.com',
    mobile: '+966 556831361',
    additionalMobile: '+966 556831361',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    streetName: 'شارع عبدالله حسين',
    districtName: '',
    buildingNumber: '',
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title={t('actions.edit')} />
      <EditClientForm
        initialData={initialData}
        onCancel={() => navigate('/financial-management/clients')}
      />
    </div>
  );
}
