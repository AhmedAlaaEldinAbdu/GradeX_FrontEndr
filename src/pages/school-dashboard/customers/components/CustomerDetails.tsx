import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { fetchCustomerById, clearCustomerDetails } from '@/redux/features/customers/customersSlice';
import { CustomerTypeEnum } from '@/services/api/types/customer.types';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import IconButton from '@/shared/components/IconButton';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
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

const dash = '-';

const customerTypeLabel = (t: (key: string) => string, type: number | null | undefined): string => {
  if (type === CustomerTypeEnum.COMPANY) return t('customers.company');
  if (type === CustomerTypeEnum.INSTITUTION) return t('customers.institution');
  if (type === CustomerTypeEnum.INDIVIDUAL) return t('customers.individual');
  return dash;
};

const formatPhone = (areaCode: string | null | undefined, phone: string | null | undefined) => {
  if (!phone) return dash;
  return areaCode ? `${areaCode} ${phone}` : phone;
};

export default function CustomerDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const customer = useSelector((state: RootState) => state.customers.customerDetails);
  const isLoading = useSelector((state: RootState) => state.customers.isLoadingDetails);

  useEffect(() => {
    if (id) dispatch(fetchCustomerById(id));
    return () => {
      dispatch(clearCustomerDetails());
    };
  }, [id, dispatch]);

  // Sections 3 & 4 (classifications / invoice) are still mock pending dedicated API
  const MOCK_INVOICE = {
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

  if (isLoading || !customer) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        {isLoading ? '...' : dash}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* -- SECTION 1: Client Data -- */}
      <Card className="p-6">
        <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
          {t('customers.clientData')}
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
              <span className="text-base font-medium text-gray-800">{customer.name}</span>
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
            <DetailRow
              label={t('customers.clientType')}
              value={customerTypeLabel(t, customer.customerType)}
            />
            <DetailRow label={t('customers.email')} value={customer.email || dash} />
            <DetailRow
              label={t('customers.additionalMobileNumber')}
              value={formatPhone(customer.additionalAreaCode, customer.additionalPhoneNumber)}
              ltr={true}
            />
            <DetailRow label={t('customers.educationalStage')} value={customer.gradeName || dash} />
          </div>
          <div className="flex flex-col gap-5 pt-0 md:pt-14">
            <DetailRow label={t('customers.idNumber')} value={customer.nationalId || dash} />
            <DetailRow
              label={t('customers.guardianMobile')}
              value={formatPhone(customer.areaCode, customer.phoneNumber)}
              ltr={true}
            />
            <DetailRow label={t('customers.schoolYear')} value={customer.classroomName || dash} />
            <DetailRow label={t('customers.grade')} value={customer.gradeName || dash} />
          </div>
        </div>
      </Card>

      {/* -- SECTION 2: Address -- */}
      <Card className="p-6">
        <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
          {t('customers.address')}
        </h2>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <DetailRow label={t('customers.country')} value={customer.lKCountries || dash} />
            <DetailRow label={t('customers.streetName')} value={customer.streetNo || dash} />
          </div>
          <div className="flex flex-col gap-5">
            <DetailRow label={t('customers.city')} value={customer.region || dash} />
            <DetailRow label={t('customers.districtName')} value={customer.neighborhood || dash} />
          </div>
        </div>
        <div className="mt-5">
          <DetailRow label={t('customers.buildingNumber')} value={customer.buldingNo || dash} />
        </div>
      </Card>

      {/* -- SECTION 3: Classifications -- */}
      <Card className="p-6">
        <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
          {t('invoices.classifications')}
        </h2>
        {MOCK_INVOICE.classifications.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
            <div className="flex flex-col gap-5">
              <DetailRow label={t('customers.item')} value={row.item} />
              <DetailRow label={t('invoices.discount')} value={row.discount} />
            </div>
            <div className="flex flex-col gap-5">
              <DetailRow label={t('customers.quantity')} value={row.quantity} />
              <DetailRow label={t('invoices.amount')} value={<RyalAmount amount={row.amount} />} />
            </div>
          </div>
        ))}
      </Card>

      {/* -- SECTION 4: Invoice Data -- */}
      <Card className="p-6">
        <h2 className="mb-6 text-start text-lg font-bold text-gray-800">
          {t('invoices.invoiceData')}
        </h2>

        <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <DetailRow label={t('invoices.table.invoiceDate')} value={MOCK_INVOICE.invoiceDate} />
            <DetailRow
              label={t('invoices.table.invoiceValue')}
              value={<RyalAmount amount={MOCK_INVOICE.invoiceValue} />}
            />
            <DetailRow label={t('invoices.discount')} value={MOCK_INVOICE.invoiceDiscount} />
          </div>
          <div className="flex flex-col gap-5">
            <DetailRow
              label={t('invoices.table.invoiceNumber')}
              value={MOCK_INVOICE.invoiceNumber}
            />
            <DetailRow
              label={t('invoices.table.tax')}
              value={<RyalAmount amount={MOCK_INVOICE.tax} />}
            />
            <DetailRow
              label={t('invoices.table.totalInvoice')}
              value={<RyalAmount amount={MOCK_INVOICE.totalInvoice} />}
            />
          </div>
        </div>

        <div className="mb-6">
          <DetailRow label={t('invoices.feeItem')} value={MOCK_INVOICE.feeDescription} />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
          <div>
            <DetailRow
              label={t('customers.paymentStatus')}
              value={
                <span className="inline-flex rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-600">
                  {MOCK_INVOICE.paymentStatus}
                </span>
              }
            />
          </div>
          <div>
            <DetailRow label={t('invoices.table.paymentTool')} value={MOCK_INVOICE.paymentTool} />
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
    </div>
  );
}
