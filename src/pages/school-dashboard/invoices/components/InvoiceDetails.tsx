import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import {
  fetchInvoiceById,
  clearInvoiceDetails,
  fetchGradeById,
  fetchClassroomById,
} from '@/redux/features/invoices/invoicesSlice';
import { fetchCustomerById, clearCustomerDetails } from '@/redux/features/customers/customersSlice';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';
import Loading from '@/shared/components/Loading';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvoicePDFTemplate from './InvoicePDFTemplate';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import DownloadBlueIcon from '@gradex/assets/icons/DowloadBlue.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import RyalIcon from '@gradex/assets/icons/Ryal.svg';

const RyalFilter =
  'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)';

const dash = '-';

const DetailRow = ({
  label,
  value,
  valueClassName = '',
  ltr = false,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  ltr?: boolean;
}) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="whitespace-nowrap text-gray-800">{label}:</span>
    <span dir={ltr ? 'ltr' : 'auto'} className={`text-gray-500 ${valueClassName}`}>
      {value}
    </span>
  </div>
);

const RyalAmount = ({ amount }: { amount: number | null | undefined }) => (
  <div className="flex items-center gap-1">
    <CustomImage src={RyalIcon} alt="Ryal" className="h-4 w-4" style={{ filter: RyalFilter }} />
    <span>{amount ?? 0}</span>
  </div>
);

export interface InvoiceDetailsHandle {
  downloadPdf: (fileName: string) => Promise<void>;
  isGeneratingPdf: boolean;
}

const InvoiceDetails = forwardRef<InvoiceDetailsHandle>((_, ref) => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const isAr = i18n.language === 'ar';

  const invoice = useSelector((state: RootState) => state.invoices.invoiceDetails);
  const isLoadingInvoice = useSelector((state: RootState) => state.invoices.isLoadingDetails);
  const customer = useSelector((state: RootState) => state.customers.customerDetails);
  const gradeDetails = useSelector((state: RootState) => state.invoices.gradeDetails);
  const classroomDetails = useSelector((state: RootState) => state.invoices.classroomDetails);

  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchInvoiceById({ id, language: i18n.language }));
    return () => {
      dispatch(clearInvoiceDetails());
    };
  }, [id, dispatch, i18n.language]);

  useEffect(() => {
    if (invoice?.customerId) {
      dispatch(fetchCustomerById(invoice.customerId));
    }
    return () => {
      dispatch(clearCustomerDetails());
    };
  }, [invoice?.customerId, dispatch]);

  useEffect(() => {
    if (invoice?.gradeId) dispatch(fetchGradeById(invoice.gradeId));
  }, [invoice?.gradeId, dispatch]);

  useEffect(() => {
    if (invoice?.classroomId) dispatch(fetchClassroomById(invoice.classroomId));
  }, [invoice?.classroomId, dispatch]);

  const downloadPdf = useCallback(
    async (fileName: string) => {
      if (!pdfRef.current || isGeneratingPdf) return;
      setIsGeneratingPdf(true);
      try {
        const canvas = await html2canvas(pdfRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [794, 1123],
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
        pdf.save(`${fileName}.pdf`);
      } catch (err) {
        console.error('Failed to generate PDF', err);
      } finally {
        setIsGeneratingPdf(false);
      }
    },
    [isGeneratingPdf]
  );

  useImperativeHandle(ref, () => ({ downloadPdf, isGeneratingPdf }), [
    downloadPdf,
    isGeneratingPdf,
  ]);

  if (isLoadingInvoice || !invoice) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading />
      </div>
    );
  }

  const gradeName =
    (isAr ? gradeDetails?.nameAr : gradeDetails?.nameEn) ??
    invoice?.gradeName ??
    (isAr ? invoice?.gradeNameAr : invoice?.gradeNameEn);
  const paymentMethodName =
    invoice?.paymentMethodName ??
    (isAr ? invoice?.paymentMethodNameAr : invoice?.paymentMethodNameEn);
  const classroomName =
    (isAr ? classroomDetails?.name : classroomDetails?.nameEn) ??
    invoice?.classroomName ??
    (isAr ? invoice?.classroomNameAr : invoice?.classroomNameEn);
  const invoiceItems = invoice?.items ?? invoice?.invoiceItemDtos ?? [];

  const PAYMENT_TYPE_CLASSES: Record<number, string> = {
    1: 'bg-green-50 text-green-600',
    2: 'bg-blue-50 text-blue-600',
  };
  const paymentBadgeClass =
    invoice?.paymentType != null
      ? (PAYMENT_TYPE_CLASSES[invoice.paymentType] ?? 'bg-gray-50 text-gray-600')
      : 'bg-gray-50 text-gray-600';

  return (
    <>
      <div className="flex flex-col gap-6 py-6">
        {/* -- SECTION 1: Personal Data -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('invoices.personalData')}
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200">
                  <CustomImage
                    src={DefaultAvatar}
                    alt="Customer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-base font-medium text-gray-800">
                  {invoice.customerName ?? dash}
                </span>
                <IconButton
                  variant="blue"
                  ariaLabel="View"
                  onClick={() => {}}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
                >
                  <CustomImage
                    src={EyeStyledIcon}
                    alt="View"
                    className="h-4 w-4"
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(43%) sepia(91%) saturate(1512%) hue-rotate(200deg) brightness(101%) contrast(94%)',
                    }}
                  />
                </IconButton>
              </div>
              <DetailRow label={t('invoices.table.educationalStage')} value={gradeName ?? dash} />
              <DetailRow label={t('invoices.classroom')} value={classroomName ?? dash} />
              <DetailRow
                label={t('invoices.guardianMobile')}
                value={
                  invoice.phoneNumber
                    ? `${customer?.areaCode ?? ''} ${invoice.phoneNumber}`.trim()
                    : dash
                }
                ltr={true}
              />
            </div>
            <div className="flex flex-col gap-5 pt-0 md:pt-14">
              <DetailRow label={t('invoices.grade')} value={gradeName ?? dash} />
              <DetailRow label={t('invoices.email')} value={customer?.email ?? dash} />
            </div>
          </div>
        </Card>

        {/* -- SECTION 2: Invoice Data -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('invoices.invoiceData')}
          </h2>
          <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <DetailRow
                label={t('invoices.table.invoiceDate')}
                value={invoice.invoiceDate?.split('T')[0] ?? dash}
              />
              <DetailRow
                label={t('invoices.paymentMethod')}
                value={
                  <span
                    className={`inline-flex rounded-full px-4 py-1.5 text-sm font-medium ${paymentBadgeClass}`}
                  >
                    {paymentMethodName ?? dash}
                  </span>
                }
              />
            </div>
            <div className="flex flex-col gap-5">
              <DetailRow
                label={t('invoices.table.invoiceNumber')}
                value={invoice.invoiceNumber ?? dash}
              />
              <DetailRow
                label={t('invoices.table.paymentTool')}
                value={paymentMethodName ?? dash}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-start text-sm font-medium text-gray-800 md:text-base">
              {t('invoices.table.paymentDocument')}:
            </span>
            {invoice.receiptUrl ? (
              <div className="w-100 flex items-center justify-between rounded-xl border border-gray-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                    <CustomImage src={PdfIcon} alt="Pdf" className="h-8 w-8 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {t('invoices.paymentDocumentImg')}
                  </span>
                </div>
                <IconButton
                  variant="blue"
                  ariaLabel="Download"
                  onClick={() => window.open(invoice.receiptUrl!, '_blank')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 transition-colors hover:bg-blue-100"
                >
                  <CustomImage src={DownloadBlueIcon} alt="Download" className="h-5 w-5" />
                </IconButton>
              </div>
            ) : (
              <span className="text-start text-sm text-gray-500">{dash}</span>
            )}
          </div>
        </Card>

        {/* -- SECTION 3: Fees Type -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('invoices.feesType')}
          </h2>
          <div className="flex flex-col gap-6">
            {invoiceItems.length > 0 ? (
              invoiceItems.map((item) => (
                <div
                  key={item.id ?? item.name}
                  className="grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2"
                >
                  <div className="flex flex-col gap-4">
                    <DetailRow label={t('invoices.feeItem')} value={item.name} />
                    <DetailRow
                      label={t('invoices.amount')}
                      value={<RyalAmount amount={item.amount} />}
                    />
                  </div>
                  {item.discount != null && (
                    <div className="flex flex-col gap-4">
                      <DetailRow label={t('invoices.discount')} value={item.discount} />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">{dash}</p>
            )}

            <div className="grid grid-cols-1 gap-x-12 gap-y-4 border-t border-gray-100 pt-4 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <DetailRow
                  label={t('invoices.table.invoiceValue')}
                  value={<RyalAmount amount={invoice.totalAmount} />}
                />
                <DetailRow label={t('invoices.discount')} value={invoice.totalDiscount} />
              </div>
              <div className="flex flex-col gap-4">
                <DetailRow label={t('invoices.table.tax')} value={`${invoice.taxPercentage}%`} />
                <DetailRow
                  label={t('invoices.table.totalInvoice')}
                  value={<RyalAmount amount={invoice.netAmount} />}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <InvoicePDFTemplate ref={pdfRef} invoice={invoice} customer={customer} />
      </div>
    </>
  );
});

InvoiceDetails.displayName = 'InvoiceDetails';

export default InvoiceDetails;
