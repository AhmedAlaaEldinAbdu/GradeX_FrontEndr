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

const RyalFilter =
  'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)';

const DetailRow = ({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: React.ReactNode;
  ltr?: boolean;
}) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="whitespace-nowrap text-gray-800">{label}:</span>
    <span dir={ltr ? 'ltr' : 'auto'} className="text-gray-500">
      {value}
    </span>
  </div>
);

const RyalAmount = ({ amount }: { amount: number }) => (
  <div className="flex items-center gap-1">
    <CustomImage src={RyalIcon} alt="Ryal" className="h-4 w-4" style={{ filter: RyalFilter }} />
    <span>{amount}</span>
  </div>
);

export default function ClientDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  void id; // used when API fetch is wired up

  const breadcrumbItems = [
    { label: t('sidebar.financialManagement') },
    { label: t('clients.title'), path: '/financial-management/clients' },
    { label: t('clients.viewClient') },
  ];

  // TODO: fetch client data by id
  const MOCK_DATA = {
    clientName: 'حازم أحمد حسن محمد',
    clientType: t('clients.individual'),
    idNumber: '123456789012',
    email: 'Ahmed@gmail.com',
    mobile: '+20 10 1234 5678',
    additionalMobile: '+20 10 1234 5678',
    educationalStage: t('invoices.stages.kindergarten'),
    schoolYear: 'رياض الأطفال',
    grade: 'KG 1',
    country: 'المملكة العربية السعودية',
    city: 'الرياض',
    streetName: 'شارع عبدالله حسين',
    districtName: 'حي 1',
    buildingNumber: '3',
    classifications: [{ item: 'رسوم دراسية-أولة', quantity: 1, amount: 300, discount: 0 }],
    invoiceDate: '1/1/2020',
    invoiceNumber: '1224556',
    invoiceValue: 600,
    tax: 100,
    totalInvoice: 900,
    invoiceDiscount: 0,
    feeDescription: 'رسوم دراسية للصف الأول الأعدادي',
    paymentStatus: t('invoices.paymentMethods.cash'),
    paymentTool: t('financialManagement.paymentChannels.eWallet'),
  };

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="clients.viewClient"
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
        {/* -- SECTION 1: Client Data -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('clients.clientData')}
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200">
                  <CustomImage
                    src={DefaultAvatar}
                    alt="Client"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-base font-medium text-gray-800">{MOCK_DATA.clientName}</span>
                <IconButton
                  variant="blue"
                  ariaLabel="Edit"
                  onClick={() => {}}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
                >
                  <CustomImage
                    src={EyeStyledIcon}
                    alt="Edit"
                    className="h-4 w-4"
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(43%) sepia(91%) saturate(1512%) hue-rotate(200deg) brightness(101%) contrast(94%)',
                    }}
                  />
                </IconButton>
              </div>
              <DetailRow label={t('clients.clientType')} value={MOCK_DATA.clientType} />
              <DetailRow label={t('clients.email')} value={MOCK_DATA.email} />
              <DetailRow
                label={t('clients.additionalMobileNumber')}
                value={MOCK_DATA.additionalMobile}
                ltr={true}
              />
              <DetailRow label={t('clients.educationalStage')} value={MOCK_DATA.educationalStage} />
            </div>
            <div className="flex flex-col gap-5 pt-0 md:pt-14">
              <DetailRow label={t('clients.idNumber')} value={MOCK_DATA.idNumber} />
              <DetailRow label={t('clients.guardianMobile')} value={MOCK_DATA.mobile} ltr={true} />
              <DetailRow label={t('clients.schoolYear')} value={MOCK_DATA.schoolYear} />
              <DetailRow label={t('clients.grade')} value={MOCK_DATA.grade} />
            </div>
          </div>
        </Card>

        {/* -- SECTION 2: Address -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('clients.address')}
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <DetailRow label={t('clients.country')} value={MOCK_DATA.country} />
              <DetailRow label={t('clients.streetName')} value={MOCK_DATA.streetName} />
            </div>
            <div className="flex flex-col gap-5">
              <DetailRow label={t('clients.city')} value={MOCK_DATA.city} />
              <DetailRow label={t('clients.districtName')} value={MOCK_DATA.districtName} />
            </div>
          </div>
          <div className="mt-5">
            <DetailRow label={t('clients.buildingNumber')} value={MOCK_DATA.buildingNumber} />
          </div>
        </Card>

        {/* -- SECTION 3: Classifications -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('invoices.classifications')}
          </h2>
          {MOCK_DATA.classifications.map((row, index) => (
            <div key={index} className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              <div className="flex flex-col gap-5">
                <DetailRow label={t('clients.item')} value={row.item} />
                <DetailRow label={t('invoices.discount')} value={row.discount} />
              </div>
              <div className="flex flex-col gap-5">
                <DetailRow label={t('clients.quantity')} value={row.quantity} />
                <DetailRow
                  label={t('invoices.amount')}
                  value={<RyalAmount amount={row.amount} />}
                />
              </div>
            </div>
          ))}
        </Card>

        {/* -- SECTION 4: Invoice Data -- */}
        <Card className="p-6">
          <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
            {t('invoices.invoiceData')}
          </h2>

          {/* Grid: 3 rows × 2 cols */}
          <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <DetailRow label={t('invoices.table.invoiceDate')} value={MOCK_DATA.invoiceDate} />
              <DetailRow
                label={t('invoices.table.invoiceValue')}
                value={<RyalAmount amount={MOCK_DATA.invoiceValue} />}
              />
              <DetailRow label={t('invoices.discount')} value={MOCK_DATA.invoiceDiscount} />
            </div>
            <div className="flex flex-col gap-5">
              <DetailRow
                label={t('invoices.table.invoiceNumber')}
                value={MOCK_DATA.invoiceNumber}
              />
              <DetailRow
                label={t('invoices.table.tax')}
                value={<RyalAmount amount={MOCK_DATA.tax} />}
              />
              <DetailRow
                label={t('invoices.table.totalInvoice')}
                value={<RyalAmount amount={MOCK_DATA.totalInvoice} />}
              />
            </div>
          </div>

          {/* Fee description — full width */}
          <div className="mb-6">
            <DetailRow label={t('invoices.feeItem')} value={MOCK_DATA.feeDescription} />
          </div>

          {/* Payment status + payment tool — 2-col row */}
          <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div>
              <DetailRow
                label={t('clients.paymentStatus')}
                value={
                  <span className="inline-flex rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-600">
                    {MOCK_DATA.paymentStatus}
                  </span>
                }
              />
            </div>
            <div>
              <DetailRow label={t('invoices.table.paymentTool')} value={MOCK_DATA.paymentTool} />
            </div>
          </div>

          {/* Payment document */}
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
      </div>
    </div>
  );
}
