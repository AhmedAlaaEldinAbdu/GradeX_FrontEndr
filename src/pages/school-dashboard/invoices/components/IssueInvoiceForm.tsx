import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import FormField from '@/shared/components/FormField';
import IconButton from '@/shared/components/IconButton';
import Input from '@/shared/components/Input';
import Table from '@/shared/components/Table';
import StyledCalendarIcon from '@/assets/icons/StyledCalendar.svg';
import RyalIcon from '@/assets/icons/Ryal.svg';
import PercentIcon from '@/assets/icons/Percent.svg';

type IssueInvoiceFormProps = {
  onCancel?: () => void;
};

type InvoiceCustomer = {
  id: string;
  name: string;
  email: string;
  mobile: string;
};

type InvoiceClassificationRow = {
  id: string;
  itemId: string;
  amount: string;
  discount: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createClassificationRow = (): InvoiceClassificationRow => ({
  id: createId(),
  itemId: '',
  amount: '',
  discount: '',
});

const customers: InvoiceCustomer[] = [
  {
    id: '1',
    name: 'أحمد حسن محمود',
    email: 'Ahmed@gmail.com',
    mobile: '+966 556813161',
  },
  {
    id: '2',
    name: 'سارة محمد علي',
    email: 'Sara@gmail.com',
    mobile: '+966 554400221',
  },
  {
    id: '3',
    name: 'محمد عبدالله سعد',
    email: 'Mohamed@gmail.com',
    mobile: '+966 553214578',
  },
];

const toNumber = (value: string) => Number(value || 0);

const currencyIcon = <CustomImage src={RyalIcon} alt="Currency" className="h-4 w-4 opacity-60" />;

export default function IssueInvoiceForm({ onCancel }: IssueInvoiceFormProps) {
  const { t } = useTranslation();

  const customerOptions = useMemo<CustomSelectOption[]>(
    () => customers.map((customer) => ({ value: customer.id, label: customer.name })),
    []
  );

  const itemOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'tuition', label: t('invoices.items.tuition') },
      { value: 'books', label: t('invoices.items.books') },
      { value: 'transport', label: t('invoices.items.transport') },
    ],
    [t]
  );

  const paymentMethodOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'cash', label: t('invoices.paymentMethods.cash') },
      { value: 'bankTransfer', label: t('invoices.paymentMethods.bankTransfer') },
      { value: 'deferred', label: t('invoices.paymentMethods.deferred') },
    ],
    [t]
  );

  const paymentToolOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'cashier', label: t('invoices.paymentTools.cashier') },
      { value: 'wallet', label: t('invoices.paymentTools.wallet') },
      { value: 'bank', label: t('invoices.paymentTools.bank') },
      { value: 'card', label: t('invoices.paymentTools.card') },
    ],
    [t]
  );

  const discountOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: 'none', label: t('invoices.discounts.none') },
      { value: 'seasonal', label: t('invoices.discounts.seasonal') },
      { value: 'sibling', label: t('invoices.discounts.sibling') },
      { value: 'staff', label: t('invoices.discounts.staff') },
    ],
    [t]
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('2025-12-04');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentTool, setPaymentTool] = useState('');
  const [discountType, setDiscountType] = useState('none');
  const [taxPercentage, setTaxPercentage] = useState('15');
  const [classificationRows, setClassificationRows] = useState<InvoiceClassificationRow[]>([
    createClassificationRow(),
  ]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [selectedCustomerId]
  );

  const subtotal = useMemo(
    () => classificationRows.reduce((sum, row) => sum + toNumber(row.amount), 0),
    [classificationRows]
  );

  const discountTotal = useMemo(
    () => classificationRows.reduce((sum, row) => sum + toNumber(row.discount), 0),
    [classificationRows]
  );

  const netAmount = Math.max(0, subtotal - discountTotal);
  const taxAmount = (netAmount * toNumber(taxPercentage)) / 100;
  const totalAmount = netAmount + taxAmount;

  const handleRowChange = (
    rowId: string,
    field: 'itemId' | 'amount' | 'discount',
    value: string
  ) => {
    setClassificationRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setClassificationRows((prev) => [...prev, createClassificationRow()]);
  };

  const handleRemoveRow = (rowId: string) => {
    setClassificationRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.id !== rowId) : [createClassificationRow()]
    );
  };

  const classificationColumns = [
    {
      header: '#',
      accessor: (_row: InvoiceClassificationRow, index?: number) => (index ? index + 1 : 1),
      headerClassName: 'w-16',
      className: 'w-16',
    },
    {
      header: 'invoices.item',
      accessor: (row: InvoiceClassificationRow) => (
        <div className="min-w-[260px]">
          <CustomSelect
            value={row.itemId}
            onChange={(value) => handleRowChange(row.id, 'itemId', String(value))}
            options={itemOptions}
            placeholder={t('invoices.chooseItem')}
            showSearch={false}
          />
        </div>
      ),
      headerClassName: 'min-w-[260px]',
      className: 'min-w-[260px]',
    },
    {
      header: 'invoices.discount',
      accessor: (row: InvoiceClassificationRow) => (
        <div className="min-w-[160px]">
          <Input
            type="number"
            min="0"
            icon={currencyIcon}
            value={row.discount}
            onChange={(event) => handleRowChange(row.id, 'discount', event.target.value)}
            placeholder={t('invoices.chooseDiscount')}
            className="!bg-white"
          />
        </div>
      ),
      headerClassName: 'min-w-[160px]',
      className: 'min-w-[160px]',
    },
    {
      header: 'invoices.amount',
      accessor: (row: InvoiceClassificationRow) => (
        <div className="min-w-[160px]">
          <Input
            type="number"
            min="0"
            icon={currencyIcon}
            value={row.amount}
            onChange={(event) => handleRowChange(row.id, 'amount', event.target.value)}
            placeholder={t('invoices.enterAmount')}
            className="!bg-white"
          />
        </div>
      ),
      headerClassName: 'min-w-[160px]',
      className: 'min-w-[160px]',
    },
    {
      header: 'common.actions',
      accessor: (row: InvoiceClassificationRow) => (
        <IconButton
          status="delete"
          variant="danger"
          ariaLabel={t('actions.delete')}
          onClick={() => handleRemoveRow(row.id)}
          className="mx-auto bg-red-50 text-red-500 shadow-none hover:bg-red-100"
        />
      ),
      headerClassName: 'min-w-[120px]',
      className: 'min-w-[120px]',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('invoices.customerName')} required>
            <CustomSelect
              value={selectedCustomerId}
              onChange={(value) => setSelectedCustomerId(String(value))}
              options={customerOptions}
              placeholder={t('invoices.chooseCustomerName')}
              maxHeight="220px"
            />
          </FormField>

          <FormField label={t('invoices.table.invoiceNumber')}>
            <Input value="#12" readOnly className="!bg-gray-50 !text-gray-500" />
          </FormField>

          <FormField label={t('invoices.email')}>
            <Input
              value={selectedCustomer?.email || ''}
              readOnly
              className="!bg-gray-50 !text-gray-500"
            />
          </FormField>

          <FormField label={t('invoices.mobileNumber')}>
            <Input
              value={selectedCustomer?.mobile || ''}
              readOnly
              dir="ltr"
              className="!bg-gray-50 !text-gray-500"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label={t('invoices.table.invoiceDate')} required>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(event) => setInvoiceDate(event.target.value)}
                icon={<CustomImage src={StyledCalendarIcon} alt="Calendar" className="h-5 w-5" />}
                className="!bg-white"
              />
            </FormField>
          </div>
        </div>
      </Card>

      <Card className="rounded-[28px] border border-gray-100 px-0 py-0 shadow-sm" padding="none">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-800">{t('invoices.classifications')}</h2>
          <Button
            variant="outline"
            size="sm"
            className="!rounded-full !px-5 !py-2 !text-sm"
            onClick={handleAddRow}
          >
            {t('invoices.addClassification')}
          </Button>
        </div>

        <div className="px-4 pb-4">
          <Table
            columns={classificationColumns}
            data={classificationRows}
            keyExtractor={(row) => row.id}
          />
        </div>
      </Card>

      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('invoices.paymentMethod')} required>
            <CustomSelect
              value={paymentMethod}
              onChange={(value) => setPaymentMethod(String(value))}
              options={paymentMethodOptions}
              placeholder={t('invoices.choosePaymentMethod')}
              showSearch={false}
            />
          </FormField>

          <FormField label={t('invoices.paymentTool')} required>
            <CustomSelect
              value={paymentTool}
              onChange={(value) => setPaymentTool(String(value))}
              options={paymentToolOptions}
              placeholder={t('invoices.choosePaymentTool')}
              showSearch={false}
            />
          </FormField>

          <FormField label={t('invoices.amount')}>
            <Input
              value={String(netAmount || '')}
              readOnly
              icon={currencyIcon}
              className="!bg-gray-50 !text-gray-500"
            />
          </FormField>

          <FormField label={t('invoices.optionalDiscount')} optional>
            <CustomSelect
              value={discountType}
              onChange={(value) => setDiscountType(String(value))}
              options={discountOptions}
              placeholder={t('invoices.chooseDiscount')}
              showSearch={false}
            />
          </FormField>

          <FormField label={t('invoices.tax')} required>
            <Input
              type="number"
              min="0"
              value={taxPercentage}
              onChange={(event) => setTaxPercentage(event.target.value)}
              placeholder={t('invoices.enterTax')}
              icon={<CustomImage src={PercentIcon} alt="Percent" className="h-4 w-4 opacity-60" />}
              className="!bg-white"
            />
          </FormField>

          <FormField label={t('invoices.totalAmount')}>
            <Input
              value={String(totalAmount || '')}
              readOnly
              icon={currencyIcon}
              className="!bg-gray-50 !text-gray-500"
            />
          </FormField>
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="success" onClick={() => {}}>
          {t('invoices.issueAndExport')}
        </Button>
      </div>
    </div>
  );
}
