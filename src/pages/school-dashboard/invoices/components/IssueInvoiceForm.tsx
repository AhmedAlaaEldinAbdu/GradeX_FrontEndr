import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { formatValidationErrors } from '@/lib/utils/error-utils';
import { fetchCustomers } from '@/redux/features/customers/customersSlice';
import { createInvoice, fetchInvoiceNumbers } from '@/redux/features/invoices/invoicesSlice';
import { fetchLKPaymentMethods } from '@/redux/features/lookups/lookupsSlice';
import { fetchOffers } from '@/redux/features/offers/offersSlice';
import {
  fetchAllInstallments,
  fetchInstallmentPlanById,
} from '@/redux/features/tuition-fees/tuitionFeesSlice';
import type { CustomerDto } from '@/services/api/types/customer.types';
import { InvoicePaymentType } from '@/shared/enums/enums';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import FormField from '@/shared/components/FormField';
import IconButton from '@/shared/components/IconButton';
import Input from '@/shared/components/Input';
import PhoneInput from '@/shared/components/PhoneInput';
import Table from '@/shared/components/Table';
import StyledCalendarIcon from '@/assets/icons/StyledCalendar.svg';
import RyalIcon from '@/assets/icons/Ryal.svg';
import PercentIcon from '@/assets/icons/Percent.svg';

type IssueInvoiceFormProps = {
  onCancel?: () => void;
};

type InstallmentOption = {
  id: string;
  name: string;
};

type InstallmentPlanOption = {
  id: string;
  name: string;
  installments: InstallmentOption[];
};

type InvoiceClassificationRow = {
  id: string;
  name: string;
  amount: string;
  discount: string;
};

type IssueInvoiceFormErrors = {
  customerName?: string;
  paymentMethod?: string;
  paymentTool?: string;
  installmentPlan?: string;
  installment?: string;
  classifications?: string;
  general?: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createClassificationRow = (): InvoiceClassificationRow => ({
  id: createId(),
  name: '',
  amount: '',
  discount: '',
});

const toNumber = (value: string) => Number(value || 0);

const currencyIcon = <CustomImage src={RyalIcon} alt="Currency" className="h-4 w-4 opacity-60" />;

export default function IssueInvoiceForm({ onCancel }: IssueInvoiceFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  const { invoiceNumbers, isCreating, error, validationErrors } = useAppSelector(
    (state) => state.invoices
  );
  const { customers, isLoading: isLoadingCustomers } = useAppSelector((state) => state.customers);
  const { lkPaymentMethods, isLoadingLKPaymentMethods } = useAppSelector((state) => state.lookups);
  const { offers, isLoading: isLoadingOffers } = useAppSelector((state) => state.offers);
  const { installments, installmentPlan, isLoadingInstallments } = useAppSelector(
    (state) => state.tuitionFees
  );

  const customerOptions = useMemo<CustomSelectOption[]>(
    () => customers.map((customer) => ({ value: customer.id, label: customer.name })),
    [customers]
  );

  const paymentTypeOptions = useMemo<CustomSelectOption[]>(
    () => [
      { value: String(InvoicePaymentType.Cash), label: t('invoices.paymentMethods.cash') },
      {
        value: String(InvoicePaymentType.Deferred),
        label: t('invoices.paymentMethods.deferred'),
      },
    ],
    [t]
  );

  const paymentMethodOptions = useMemo<CustomSelectOption[]>(
    () =>
      lkPaymentMethods.map((method) => ({
        value: method.id,
        label: currentLang === 'ar' ? method.arabicName : method.englishName,
      })),
    [currentLang, lkPaymentMethods]
  );

  const offerOptions = useMemo<CustomSelectOption[]>(
    () =>
      offers.map((offer) => ({
        value: offer.id,
        label: currentLang === 'ar' ? offer.nameAr : offer.nameEn,
      })),
    [currentLang, offers]
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('2025-12-04');
  const [paymentType, setPaymentType] = useState(String(InvoicePaymentType.Cash));
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [installmentId, setInstallmentId] = useState('');
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [amount, setAmount] = useState('');
  const [isAmountEdited, setIsAmountEdited] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState('');
  const [classificationRows, setClassificationRows] = useState<InvoiceClassificationRow[]>([
    createClassificationRow(),
  ]);
  const [formErrors, setFormErrors] = useState<IssueInvoiceFormErrors>({});

  const isDeferredPayment = Number(paymentType) === InvoicePaymentType.Deferred;

  const selectedCustomer = useMemo<CustomerDto | null>(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const subtotal = useMemo(
    () => classificationRows.reduce((sum, row) => sum + toNumber(row.amount), 0),
    [classificationRows]
  );

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId]
  );

  const customerInstallmentPlans = useMemo<InstallmentPlanOption[]>(() => {
    return [];
  }, []);

  const installmentPlanOptions = useMemo<CustomSelectOption[]>(
    () =>
      customerInstallmentPlans.map((plan) => ({
        value: plan.id,
        label: plan.name,
      })),
    [customerInstallmentPlans]
  );

  // const selectedInstallmentPlan = useMemo(
  //   () => customerInstallmentPlans.find((plan) => plan.id === installmentPlanId) ?? null,
  //   [customerInstallmentPlans, installmentPlanId]
  // );

  const installmentOptions = useMemo<CustomSelectOption[]>(
    () =>
      installments.map((inst) => ({
        value: inst.id,
        label: new Date(inst.dueDate).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })),
    [installments]
  );

  const calculatedAmount = useMemo(() => Math.max(0, subtotal), [subtotal]);
  const amountValue = toNumber(amount);

  const offerDiscount = useMemo(() => {
    if (!selectedOffer) {
      return 0;
    }

    if (selectedOffer.percentage !== null && selectedOffer.percentage !== undefined) {
      return (amountValue * selectedOffer.percentage) / 100;
    }

    return selectedOffer.amount ?? 0;
  }, [amountValue, selectedOffer]);

  const rowDiscountTotal = useMemo(
    () => classificationRows.reduce((sum, row) => sum + toNumber(row.discount), 0),
    [classificationRows]
  );

  const discountTotal = rowDiscountTotal + offerDiscount;
  const netAmount = Math.max(0, amountValue - discountTotal);
  const taxAmount = (netAmount * toNumber(taxPercentage)) / 100;
  const totalAmount = netAmount + taxAmount;

  useEffect(() => {
    if (customers.length === 0) {
      dispatch(fetchCustomers({ PageIndex: 1, PageSize: 1000, schoolBranchId }));
    }
  }, [customers.length, dispatch]);

  useEffect(() => {
    if (lkPaymentMethods.length === 0) {
      dispatch(fetchLKPaymentMethods({ params: { PageIndex: 1, PageSize: 10000 } }));
    }
  }, [dispatch, lkPaymentMethods.length]);

  useEffect(() => {
    dispatch(fetchInvoiceNumbers());
  }, [dispatch]);

  useEffect(() => {
    if (!schoolBranchId) {
      return;
    }

    dispatch(
      fetchOffers({
        SchoolBranchId: schoolBranchId,
        IsActive: true,
        PageIndex: 1,
        PageSize: 1000,
      })
    );

    dispatch(fetchAllInstallments({ schoolBranchId, PageNumber: 1, PageSize: 1000 }));
  }, [dispatch, schoolBranchId]);

  useEffect(() => {
    if (!invoiceNumber && invoiceNumbers.length > 0) {
      setInvoiceNumber(invoiceNumbers[invoiceNumbers.length - 1] ?? '');
    }
  }, [invoiceNumber, invoiceNumbers]);

  useEffect(() => {
    setEmail(selectedCustomer?.email ?? '');
    const areaCode = selectedCustomer?.areaCode ?? '';
    const phone = selectedCustomer?.phoneNumber ?? '';
    setMobile(areaCode && phone ? `${areaCode}${phone}` : '');
  }, [selectedCustomer]);

  useEffect(() => {
    setInstallmentId('');
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!installmentId) {
      return;
    }

    dispatch(fetchInstallmentPlanById(installmentId));
  }, [dispatch, installmentId]);

  useEffect(() => {
    if (!isDeferredPayment) {
      setInstallmentId('');
    }
  }, [isDeferredPayment]);

  useEffect(() => {
    if (!isAmountEdited) {
      setAmount(calculatedAmount ? String(calculatedAmount) : '');
    }
  }, [calculatedAmount, isAmountEdited]);

  const clearError = (field: keyof IssueInvoiceFormErrors) => {
    setFormErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return { ...prev, [field]: undefined };
    });
  };

  const handleRowChange = (rowId: string, field: 'name' | 'amount' | 'discount', value: string) => {
    clearError('classifications');
    clearError('general');
    setClassificationRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    clearError('classifications');
    setClassificationRows((prev) => [...prev, createClassificationRow()]);
  };

  const handleRemoveRow = (rowId: string) => {
    clearError('classifications');
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
          <Input
            value={row.name}
            onChange={(event) => handleRowChange(row.id, 'name', event.target.value)}
            placeholder={t('invoices.chooseItem')}
            className="!bg-white"
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

  const handleSubmit = async () => {
    const nextErrors: IssueInvoiceFormErrors = {};

    if (!selectedCustomerId) {
      nextErrors.customerName = t('invoices.chooseCustomerName');
    }

    if (!schoolBranchId) {
      nextErrors.general = t('common.error');
    }

    if (!paymentType) {
      nextErrors.paymentMethod = t('invoices.choosePaymentMethod');
    }

    if (!paymentMethodId) {
      nextErrors.paymentTool = t('invoices.choosePaymentTool');
    }

    if (isDeferredPayment && installmentPlanOptions.length > 0) {
      nextErrors.installmentPlan = 'اختر خطة القسط';
    }

    if (isDeferredPayment && installmentOptions.length > 0 && !installmentId) {
      nextErrors.installment = 'اختر القسط';
    }

    const invoiceItemDtos = classificationRows
      .map((row) => ({
        name: row.name.trim(),
        amount: toNumber(row.amount),
        discount: toNumber(row.discount),
      }))
      .filter((row) => row.name && row.amount > 0);

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});

    try {
      const response = await dispatch(
        createInvoice({
          customerId: selectedCustomerId,
          schoolBranchId,
          invoiceNumber: invoiceNumber.trim(),
          invoiceDate: new Date(invoiceDate).toISOString(),
          totalAmount,
          totalDiscount: discountTotal,
          netAmount,
          taxPercentage: toNumber(taxPercentage),
          paymentType: Number(paymentType),
          installmentPlanId: isDeferredPayment ? (installmentPlan?.id ?? null) : null,
          installmentId: isDeferredPayment ? installmentId || null : null,
          invoiceItemDtos,
          paymentMethodId,
        })
      ).unwrap();

      if (response.isSuccess) {
        onCancel?.();
        return;
      }

      setFormErrors({
        general: formatValidationErrors(response.validationErrors, t('common.error')),
      });
    } catch (submitError) {
      setFormErrors({
        general: formatValidationErrors(
          validationErrors || error || submitError,
          t('common.error')
        ),
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('invoices.customerName')} required error={formErrors.customerName}>
            <CustomSelect
              value={selectedCustomerId}
              onChange={(value) => {
                setSelectedCustomerId(String(value));
                clearError('customerName');
                clearError('general');
              }}
              options={customerOptions}
              placeholder={t('invoices.chooseCustomerName')}
              maxHeight="220px"
              disabled={isLoadingCustomers}
            />
          </FormField>

          <FormField label={t('invoices.table.invoiceNumber')}>
            <Input
              value={invoiceNumber}
              readOnly
              className="cursor-default !bg-gray-50 !text-gray-500"
            />
          </FormField>

          <FormField label={t('invoices.email')}>
            <Input value={email} readOnly className="cursor-default !bg-gray-50 !text-gray-500" />
          </FormField>

          <FormField label={t('invoices.mobileNumber')}>
            <PhoneInput value={mobile} disabled />
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
          <FormField label={t('invoices.paymentMethod')} required error={formErrors.paymentMethod}>
            <CustomSelect
              value={paymentType}
              onChange={(value) => {
                setPaymentType(String(value));
                clearError('paymentMethod');
                clearError('installmentPlan');
                clearError('installment');
                clearError('general');
              }}
              options={paymentTypeOptions}
              placeholder={t('invoices.choosePaymentMethod')}
              showSearch={false}
            />
          </FormField>

          <FormField label={t('invoices.paymentTool')} required error={formErrors.paymentTool}>
            <CustomSelect
              value={paymentMethodId}
              onChange={(value) => {
                setPaymentMethodId(String(value));
                clearError('paymentTool');
                clearError('general');
              }}
              options={paymentMethodOptions}
              placeholder={t('invoices.choosePaymentTool')}
              showSearch={false}
              disabled={isLoadingLKPaymentMethods}
            />
          </FormField>

          {isDeferredPayment && (
            <FormField label="القسط" required error={formErrors.installment}>
              <CustomSelect
                value={installmentId}
                onChange={(value) => {
                  setInstallmentId(String(value));
                  clearError('installmentPlan');
                  clearError('installment');
                  clearError('general');
                }}
                options={installmentOptions}
                placeholder="اختر القسط"
                showSearch={false}
                disabled={isLoadingInstallments}
              />
            </FormField>
          )}

          <FormField label={t('invoices.amount')}>
            <Input
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setIsAmountEdited(true);
                clearError('general');
              }}
              icon={currencyIcon}
              className="!bg-white"
            />
          </FormField>

          <FormField label={t('invoices.optionalDiscount')} optional>
            <CustomSelect
              value={selectedOfferId}
              onChange={(value) => setSelectedOfferId(String(value))}
              options={offerOptions}
              placeholder={t('invoices.chooseDiscount')}
              showSearch={false}
              disabled={isLoadingOffers}
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
              className="cursor-default !bg-gray-50 !text-gray-500"
            />
          </FormField>
        </div>
        {formErrors.general && <p className="mt-4 text-sm text-red-500">{formErrors.general}</p>}
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button variant="success" onClick={handleSubmit} loading={isCreating}>
          {t('invoices.issueAndExport')}
        </Button>
      </div>
    </div>
  );
}
