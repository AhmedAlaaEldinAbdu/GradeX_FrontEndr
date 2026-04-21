import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { tokenManager } from '@/lib/auth';
import { formatValidationErrors } from '@/lib/utils/error-utils';
import { fetchCustomers } from '@/redux/features/customers/customersSlice';
import {
  clearInvoiceItems,
  createInvoice,
  fetchInvoiceById,
  fetchInvoiceItems,
  fetchInvoiceNumbers,
} from '@/redux/features/invoices/invoicesSlice';
import { fetchLKPaymentMethods } from '@/redux/features/lookups/lookupsSlice';
import { fetchOffers } from '@/redux/features/offers/offersSlice';
import {
  fetchAllInstallments,
  fetchInstallmentPlanById,
} from '@/redux/features/tuition-fees/tuitionFeesSlice';
import type { CustomerDto } from '@/services/api/types/customer.types';
import type { InvoiceDto } from '@/services/api/types/invoice.types';
import { InvoicePaymentType } from '@/shared/enums/enums';
import Button from '@/shared/components/Button';
import IconButton from '@/shared/components/IconButton';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect, { type CustomSelectOption } from '@/shared/components/CustomSelect';
import FormField from '@/shared/components/FormField';
import Input from '@/shared/components/Input';
import PhoneInput from '@/shared/components/PhoneInput';
import Table from '@/shared/components/Table';
import InvoicePDFTemplate from './InvoicePDFTemplate';
import ExportInvoicePopup from '../popups/ExportInvoicePopup';
import {
  IssueInvoiceSchema,
  type IssueInvoiceFormValues,
} from '@/validations/invoices-validations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import StyledCalendarIcon from '@/assets/icons/StyledCalendar.svg';
import RyalIcon from '@/assets/icons/Ryal.svg';
import PercentIcon from '@/assets/icons/Percent.svg';

type IssueInvoiceFormProps = {
  onCancel?: () => void;
};

type ClassificationRow = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  amount: string;
  discount: string;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const toNumber = (value: string) => Number(value || 0);
const createClassificationRow = (): ClassificationRow => ({
  id: createId(),
  nameAr: '',
  nameEn: null,
  amount: '',
  discount: '',
});

const currencyIcon = <CustomImage src={RyalIcon} alt="Currency" className="h-4 w-4 opacity-60" />;

export default function IssueInvoiceForm({ onCancel }: IssueInvoiceFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const currentLang = (i18n.language as 'ar' | 'en') ?? 'ar';
  const schoolBranchId = tokenManager.getUserData()?.schoolBranchId ?? '';

  const {
    invoiceNumbers,
    invoiceItems,
    isLoadingInvoiceItems,
    isCreating,
    error,
    validationErrors,
  } = useAppSelector((state) => state.invoices);
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

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IssueInvoiceFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(IssueInvoiceSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      customerId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      paymentMethodId: '',
      taxPercentage: null,
      paymentType: String(InvoicePaymentType.Cash),
      installmentId: null,
    },
  });

  const selectedCustomerId = watch('customerId');
  const paymentType = watch('paymentType') ?? String(InvoicePaymentType.Cash);
  const installmentId = watch('installmentId');
  const taxPercentage = watch('taxPercentage');

  // Non-validated state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [taxPercentageInput, setTaxPercentageInput] = useState('');
  const [classificationRows, setClassificationRows] = useState<ClassificationRow[]>([
    createClassificationRow(),
  ]);
  const [classificationsError, setClassificationsError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [createdInvoice, setCreatedInvoice] = useState<InvoiceDto | null>(null);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const isDeferredPayment = Number(paymentType) === InvoicePaymentType.Deferred;

  const selectedCustomer = useMemo<CustomerDto | null>(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

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

  const offerOptions = useMemo<CustomSelectOption[]>(
    () =>
      offers.map((offer) => ({
        value: offer.id,
        label: currentLang === 'ar' ? offer.nameAr : offer.nameEn,
      })),
    [currentLang, offers]
  );

  const subtotal = useMemo(
    () => classificationRows.reduce((sum, row) => sum + toNumber(row.amount), 0),
    [classificationRows]
  );

  const rowDiscountTotal = useMemo(
    () => classificationRows.reduce((sum, row) => sum + toNumber(row.discount), 0),
    [classificationRows]
  );

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? null,
    [offers, selectedOfferId]
  );

  const calculatedAmount = subtotal;

  const offerDiscount = useMemo(() => {
    if (!selectedOffer) return 0;
    if (selectedOffer.percentage !== null && selectedOffer.percentage !== undefined) {
      return (calculatedAmount * selectedOffer.percentage) / 100;
    }
    return selectedOffer.amount ?? 0;
  }, [calculatedAmount, selectedOffer]);

  const discountTotal = rowDiscountTotal + offerDiscount;
  const netAmount = Math.max(0, subtotal - discountTotal);
  const taxAmount = (netAmount * Number(taxPercentage ?? 0)) / 100;
  const totalAmount = netAmount + taxAmount;

  useEffect(() => {
    if (customers.length === 0) {
      dispatch(fetchCustomers({ PageIndex: 1, PageSize: 1000, schoolBranchId }));
    }
  }, [customers.length, dispatch, schoolBranchId]);

  useEffect(() => {
    if (lkPaymentMethods.length === 0) {
      dispatch(fetchLKPaymentMethods({ params: { PageIndex: 1, PageSize: 10000 } }));
    }
  }, [dispatch, lkPaymentMethods.length]);

  useEffect(() => {
    dispatch(fetchInvoiceNumbers());
    return () => {
      dispatch(clearInvoiceItems());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!schoolBranchId) {
      return;
    }
    dispatch(fetchAllInstallments({ schoolBranchId, PageNumber: 1, PageSize: 1000 }));
    dispatch(
      fetchOffers({ SchoolBranchId: schoolBranchId, IsActive: true, PageIndex: 1, PageSize: 1000 })
    );
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

    if (selectedCustomer?.studentId) {
      setClassificationRows([createClassificationRow()]);
      dispatch(fetchInvoiceItems(selectedCustomer.studentId));
    } else {
      setClassificationRows([createClassificationRow()]);
    }
  }, [dispatch, selectedCustomer]);

  useEffect(() => {
    if (invoiceItems?.items && invoiceItems.items.length > 0) {
      setClassificationRows(
        invoiceItems.items.map((item) => ({
          id: item.id,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          amount: String(item.amount),
          discount: '',
        }))
      );
    }
  }, [invoiceItems]);

  useEffect(() => {
    setValue('installmentId', null);
  }, [selectedCustomerId, setValue]);

  useEffect(() => {
    if (!installmentId) {
      return;
    }

    dispatch(fetchInstallmentPlanById(installmentId));
  }, [dispatch, installmentId]);

  useEffect(() => {
    if (!isDeferredPayment) {
      setValue('installmentId', null);
    }
  }, [isDeferredPayment, setValue]);

  const handleRowChange = (
    rowId: string,
    field: 'nameAr' | 'amount' | 'discount',
    value: string
  ) => {
    setClassificationsError('');
    setGeneralError('');
    setClassificationRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = () => {
    setClassificationsError('');
    setClassificationRows((prev) => [...prev, createClassificationRow()]);
  };

  const handleRemoveRow = (rowId: string) => {
    setClassificationsError('');
    setClassificationRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.id !== rowId) : [createClassificationRow()]
    );
  };

  const classificationColumns = [
    {
      header: '#',
      accessor: (_row: ClassificationRow, index?: number) => (index !== undefined ? index + 1 : 1),
      headerClassName: 'w-16',
      className: 'w-16',
    },
    {
      header: 'invoices.item',
      accessor: (row: ClassificationRow) => (
        <div className="min-w-[260px]">
          <Input
            value={currentLang === 'ar' ? row.nameAr : (row.nameEn ?? row.nameAr)}
            onChange={(e) => handleRowChange(row.id, 'nameAr', e.target.value)}
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
      accessor: (row: ClassificationRow) => (
        <div className="min-w-[160px]">
          <Input
            type="number"
            min="0"
            icon={currencyIcon}
            value={row.discount}
            onChange={(e) => handleRowChange(row.id, 'discount', e.target.value)}
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
      accessor: (row: ClassificationRow) => (
        <div className="min-w-[160px]">
          <Input
            type="number"
            min="0"
            icon={currencyIcon}
            value={row.amount}
            onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
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
      accessor: (row: ClassificationRow) => (
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

  const onSubmit = async (data: IssueInvoiceFormValues) => {
    if (!schoolBranchId) {
      setGeneralError(t('common.error'));
      return;
    }

    const invoiceItemDtos = classificationRows
      .map((row) => ({
        name: currentLang === 'ar' ? row.nameAr : (row.nameEn ?? row.nameAr),
        amount: toNumber(row.amount),
        discount: toNumber(row.discount),
      }))
      .filter((row) => row.name.trim() && row.amount > 0);

    if (invoiceItemDtos.length === 0) {
      setClassificationsError(t('invoices.validation.classificationsRequired'));
      return;
    }

    setClassificationsError('');
    setGeneralError('');

    try {
      const response = await dispatch(
        createInvoice({
          customerId: data.customerId,
          schoolBranchId,
          invoiceNumber: invoiceNumber.trim(),
          invoiceDate: new Date(data.invoiceDate).toISOString(),
          totalAmount,
          totalDiscount: discountTotal,
          netAmount,
          taxPercentage: data.taxPercentage ?? 0,
          paymentType: Number(data.paymentType),
          installmentPlanId: isDeferredPayment ? (installmentPlan?.id ?? null) : null,
          installmentId: isDeferredPayment ? data.installmentId || null : null,
          invoiceItemDtos,
          paymentMethodId: data.paymentMethodId,
        })
      ).unwrap();

      if (response.isSuccess) {
        const createdId = response.data?.id;
        if (createdId) {
          const fullAction = await dispatch(fetchInvoiceById({ id: createdId }));
          if (fetchInvoiceById.fulfilled.match(fullAction)) {
            setCreatedInvoice(fullAction.payload);
          } else {
            setCreatedInvoice(response.data ?? null);
          }
        } else {
          setCreatedInvoice(response.data ?? null);
        }
        setIsExportPopupOpen(true);
        return;
      }

      setGeneralError(formatValidationErrors(response.validationErrors, t('common.error')));
    } catch (submitError) {
      setGeneralError(
        formatValidationErrors(validationErrors || error || submitError, t('common.error'))
      );
    }
  };

  const handleExportPdf = async (fileName: string) => {
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
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField label={t('invoices.customerName')} required error={errors.customerId?.message}>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(value) => field.onChange(String(value))}
                  options={customerOptions}
                  placeholder={t('invoices.chooseCustomerName')}
                  maxHeight="220px"
                  disabled={isLoadingCustomers}
                />
              )}
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
            <FormField
              label={t('invoices.table.invoiceDate')}
              required
              error={errors.invoiceDate?.message}
            >
              <Controller
                name="invoiceDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    icon={
                      <CustomImage src={StyledCalendarIcon} alt="Calendar" className="h-5 w-5" />
                    }
                    className="!bg-white"
                  />
                )}
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
          {isLoadingInvoiceItems ? (
            <p className="py-4 text-center text-sm text-gray-500">{t('common.loading')}</p>
          ) : (
            <Table
              columns={classificationColumns}
              data={classificationRows}
              keyExtractor={(row) => row.id}
            />
          )}
          {!isLoadingInvoiceItems && classificationsError && (
            <p className="mt-2 text-sm text-red-500">{classificationsError}</p>
          )}
        </div>
      </Card>

      <Card className="rounded-[28px] border border-gray-100 shadow-sm" padding="lg">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label={t('invoices.paymentMethod')}
            required
            error={errors.paymentType?.message}
          >
            <Controller
              name="paymentType"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value ?? ''}
                  onChange={(value) => field.onChange(String(value))}
                  options={paymentTypeOptions}
                  placeholder={t('invoices.choosePaymentMethod')}
                  showSearch={false}
                />
              )}
            />
          </FormField>

          <FormField
            label={t('invoices.paymentTool')}
            required
            error={errors.paymentMethodId?.message}
          >
            <Controller
              name="paymentMethodId"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={(value) => field.onChange(String(value))}
                  options={paymentMethodOptions}
                  placeholder={t('invoices.choosePaymentTool')}
                  showSearch={false}
                  disabled={isLoadingLKPaymentMethods}
                />
              )}
            />
          </FormField>

          {isDeferredPayment && (
            <FormField label="القسط" required error={errors.installmentId?.message}>
              <Controller
                name="installmentId"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value ?? ''}
                    onChange={(value) => field.onChange(String(value))}
                    options={installmentOptions}
                    placeholder="اختر القسط"
                    showSearch={false}
                    disabled={isLoadingInstallments}
                  />
                )}
              />
            </FormField>
          )}

          <FormField label={t('invoices.amount')}>
            <Input
              value={String(calculatedAmount || '')}
              readOnly
              icon={currencyIcon}
              className="cursor-default !bg-gray-50 !text-gray-500"
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

          <FormField label={t('invoices.tax')}>
            <Controller
              name="taxPercentage"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  value={taxPercentageInput}
                  onChange={(event) => {
                    const val = event.target.value;
                    setTaxPercentageInput(val);
                    field.onChange(val === '' ? null : Number(val));
                  }}
                  onBlur={field.onBlur}
                  placeholder={t('invoices.enterTax')}
                  icon={
                    <CustomImage src={PercentIcon} alt="Percent" className="h-4 w-4 opacity-60" />
                  }
                  className="!bg-white"
                />
              )}
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
        {generalError && <p className="mt-4 text-sm text-red-500">{generalError}</p>}
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="success"
          onClick={handleSubmit(onSubmit)}
          disabled={isCreating}
          className={`bg-[#005B48] px-8 ${isCreating ? 'opacity-50' : ''}`}
        >
          {isCreating ? t('common.saving') : t('invoices.issueAndExport')}
        </Button>
      </div>

      <ExportInvoicePopup
        open={isExportPopupOpen}
        onClose={() => {
          setIsExportPopupOpen(false);
          onCancel?.();
        }}
        onExport={handleExportPdf}
        isExporting={isGeneratingPdf}
        showSuccessStep
      />

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <InvoicePDFTemplate ref={pdfRef} invoice={createdInvoice} customer={selectedCustomer} />
      </div>
    </div>
  );
}
