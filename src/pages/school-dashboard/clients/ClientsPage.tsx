import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import ClientsList from './components/ClientsList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';
import DotsBlackIcon from '@gradex/assets/icons/DotsBlack.svg';

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
          {
            label: '',
            onClick: () => {},
            variant: 'ghost',
            className: '!p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100',
            imgSrc: DotsBlackIcon,
            imgClassName: 'w-[20px] h-[20px]',
          },
        ]}
      />

      <ClientsList />
    </div>
  );
}
