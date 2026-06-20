import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import InvoicesList from './components/InvoicesList';
import PlusIcon from '@gradex/assets/icons/Plus.svg';

export default function InvoicesPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
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
        hasHeaderControls={true}
        actions={[
          {
            label: 'invoices.issueInvoice',
            to: '/financial-management/invoices/issue',
            variant: 'primary',
            imgSrc: PlusIcon,
            imgClassName: 'w-10 h-10',
            circle: true,
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
