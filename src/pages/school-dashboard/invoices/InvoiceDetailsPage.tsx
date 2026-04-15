import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Breadcrumb from '@/shared/layout/Breadcrumb';
import PageHeader from '@/shared/components/PageHeader';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import PrintIcon from '@gradex/assets/icons/Print.svg';
import DownloadBlueIcon from '@gradex/assets/icons/DowloadBlue.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import RyalIcon from '@gradex/assets/icons/Ryal.svg';

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

export default function InvoiceDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  console.log(id);

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('invoices.title'), path: '/financial-management/invoices' },
    { label: t('invoices.invoiceDetails') },
  ];

  // Dummy mock data for the details view
  const MOCK_DATA = {
    studentName: 'أحمد معتز حسن',
    stage: t('invoices.stages.kindergarten'),
    guardianName: 'معتز حسن',
    guardianMobile: '+20 10 1234 5678',
    grade: 'KG 1',
    email: 'Ahmed@gmail.com',
    invoiceDate: '1/1/2020',
    invoiceNumber: '1224556',
    paymentMethod: 'cash',
    paymentTool: t('financialManagement.paymentChannels.eWallet'),
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
            onClick: () => window.print(),
            variant: 'ghost',
            className:
              'flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors shrink-0',
            imgSrc: PrintIcon,
            imgClassName: 'w-8 h-8',
          },
        ]}
      />

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
                    alt="Student"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-base font-medium text-gray-800">{MOCK_DATA.studentName}</span>
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
              <DetailRow label={t('invoices.table.educationalStage')} value={MOCK_DATA.stage} />
              <DetailRow label={t('invoices.guardianName')} value={MOCK_DATA.guardianName} />
              <DetailRow
                label={t('invoices.guardianMobile')}
                value={MOCK_DATA.guardianMobile}
                ltr={true}
              />
            </div>
            <div className="flex flex-col gap-5 pt-0 md:pt-14">
              <DetailRow label={t('invoices.grade')} value={MOCK_DATA.grade} />
              <DetailRow label={t('invoices.email')} value={MOCK_DATA.email} />
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
              <DetailRow label={t('invoices.table.invoiceDate')} value={MOCK_DATA.invoiceDate} />
              <DetailRow
                label={t('invoices.paymentMethod')}
                value={
                  <span className="inline-flex rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-600">
                    {t('invoices.paymentMethods.cash')}
                  </span>
                }
              />
            </div>
            <div className="flex flex-col gap-5">
              <DetailRow
                label={t('invoices.table.invoiceNumber')}
                value={MOCK_DATA.invoiceNumber}
              />
              <DetailRow label={t('invoices.table.paymentTool')} value={MOCK_DATA.paymentTool} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-start text-sm font-medium text-gray-800 md:text-base">
              {t('invoices.table.paymentDocument')}:
            </span>
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
                onClick={() => {}}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 transition-colors hover:bg-blue-100"
              >
                <CustomImage src={DownloadBlueIcon} alt="Download" className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        </Card>

        {/* -- SECTION 3: Fees Type -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('invoices.feesType')}
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <DetailRow label={t('invoices.feeItem')} value="رسوم دراسية للصف الأول الأعدادي" />
              <DetailRow label={t('invoices.feeItem')} value={t('invoices.items.books')} />
              <DetailRow
                label={t('invoices.table.invoiceValue')}
                value={
                  <div className="flex items-center gap-1">
                    <CustomImage
                      src={RyalIcon}
                      alt="Ryal"
                      className="h-4 w-4"
                      style={{
                        filter:
                          'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)',
                      }}
                    />
                    <span>600</span>
                  </div>
                }
              />
              <DetailRow label={t('invoices.discount')} value="0" />
            </div>
            <div className="flex flex-col gap-5">
              <DetailRow
                label={t('invoices.amount')}
                value={
                  <div className="flex items-center gap-1">
                    <CustomImage
                      src={RyalIcon}
                      alt="Ryal"
                      className="h-4 w-4"
                      style={{
                        filter:
                          'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)',
                      }}
                    />
                    <span>300</span>
                  </div>
                }
              />
              <DetailRow
                label={t('invoices.amount')}
                value={
                  <div className="flex items-center gap-1">
                    <CustomImage
                      src={RyalIcon}
                      alt="Ryal"
                      className="h-4 w-4"
                      style={{
                        filter:
                          'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)',
                      }}
                    />
                    <span>300</span>
                  </div>
                }
              />
              <DetailRow
                label={t('invoices.table.tax')}
                value={
                  <div className="flex items-center gap-1">
                    <CustomImage
                      src={RyalIcon}
                      alt="Ryal"
                      className="h-4 w-4"
                      style={{
                        filter:
                          'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)',
                      }}
                    />
                    <span>300</span>
                  </div>
                }
              />
              <DetailRow
                label={t('invoices.table.totalInvoice')}
                value={
                  <div className="flex items-center gap-1">
                    <CustomImage
                      src={RyalIcon}
                      alt="Ryal"
                      className="h-4 w-4"
                      style={{
                        filter:
                          'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)',
                      }}
                    />
                    <span>900</span>
                  </div>
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
