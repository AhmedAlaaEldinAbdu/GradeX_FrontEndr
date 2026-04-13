import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import InvoicesList from './components/InvoicesList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function InvoicesPage() {
  const { t } = useTranslation();

  if (import.meta.env.MODE !== 'development') {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t('invoices.title')}</h2>
        <p className="mt-4 text-gray-600">{t('common.comingSoon')}</p>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('invoices.title') },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Header */}
      <PageHeader
        title="invoices.title"
        actions={[
          {
            label: 'invoices.issueInvoice',
            to: '/financial-management/invoices/issue',
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-[20px] h-[20px]',
          },
        ]}
      />

      {/* Page Content */}
      <div className="py-6">
        <InvoicesList />
      </div>
    </div>
  );
}
