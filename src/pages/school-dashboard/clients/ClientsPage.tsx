import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import ClientsList from './components/ClientsList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function ClientsPage() {
  const { t } = useTranslation();

  if (import.meta.env.MODE !== 'development') {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('clients.title')}</h2>
        <p className="mt-4 text-gray-600">{t('common.comingSoon')}</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('clients.title') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="clients.title"
        actions={[
          {
            label: 'clients.addClient',
            onClick: () => {},
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-4 h-4',
          },
        ]}
      />

      <ClientsList />
    </div>
  );
}
