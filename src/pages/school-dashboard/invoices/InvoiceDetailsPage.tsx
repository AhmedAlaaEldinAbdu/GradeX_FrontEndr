import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import InvoiceDetails, { type InvoiceDetailsHandle } from './components/InvoiceDetails';
import ExportInvoicePopup from './popups/ExportInvoicePopup';

import PrintIcon from '@gradex/assets/icons/Print.svg';

export default function InvoiceDetailsPage() {
  const { t } = useTranslation();
  const detailsRef = useRef<InvoiceDetailsHandle>(null);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('invoices.title'), path: '/financial-management/invoices' },
    { label: t('invoices.invoiceDetails') },
  ];

  const handleExport = async (fileName: string) => {
    setIsExporting(true);
    await detailsRef.current?.downloadPdf(fileName);
    setIsExporting(false);
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="invoices.detailsTitle"
        hasHeaderControls={false}
        actions={[
          {
            label: '',
            onClick: () => setIsExportPopupOpen(true),
            variant: 'ghost',
            className:
              'flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shrink-0',
            imgSrc: PrintIcon,
            imgClassName: 'w-8 h-8',
          },
        ]}
      />
      <InvoiceDetails ref={detailsRef} />

      <ExportInvoicePopup
        open={isExportPopupOpen}
        onClose={() => setIsExportPopupOpen(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
}
