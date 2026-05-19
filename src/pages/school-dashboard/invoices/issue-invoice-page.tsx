import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import IssueInvoiceForm from './components/IssueInvoiceForm';

export default function IssueInvoicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: t('sidebar.financialAffairs') },
    { label: t('sidebar.financialManagement') },
    { label: t('invoices.title'), path: '/financial-management/invoices' },
    { label: t('invoices.issueInvoice') },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader title="invoices.issueInvoice" />
      <IssueInvoiceForm onCancel={() => navigate('/financial-management/invoices')} />
    </div>
  );
}
