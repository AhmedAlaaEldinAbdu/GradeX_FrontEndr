import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import InvoiceDetails, { type InvoiceDetailsHandle } from './components/InvoiceDetails';

import PrintIcon from '@gradex/assets/icons/Print.svg';

export default function InvoiceDetailsPage() {
  const { t } = useTranslation();
  const detailsRef = useRef<InvoiceDetailsHandle>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('invoices.title'), path: '/financial-management/invoices' },
    { label: t('invoices.invoiceDetails') },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="invoices.detailsTitle"
        hasHeaderControls={false}
        actions={[
          {
            label: '',
            onClick: async () => {
              setIsGeneratingPdf(true);
              await detailsRef.current?.downloadPdf();
              setIsGeneratingPdf(false);
            },
            variant: 'ghost',
            className:
              'flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shrink-0',
            imgSrc: PrintIcon,
            imgClassName: `w-8 h-8 ${isGeneratingPdf ? 'animate-pulse' : ''}`,
          },
        ]}
      />
      <InvoiceDetails ref={detailsRef} />
    </div>
  );
}
