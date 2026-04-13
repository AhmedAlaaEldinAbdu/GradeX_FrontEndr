import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { fetchInvoices } from '@/redux/features/invoices/invoicesSlice';
import { tokenManager } from '@/lib/auth/token-manager';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import type { InvoiceDto } from '@/services/api/types/invoice.types';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';
import RyalIcon from '@gradex/assets/icons/Ryal.svg';

const RyalFilter =
  'brightness(0) saturate(100%) invert(43%) sepia(8%) saturate(301%) hue-rotate(182deg) brightness(94%) contrast(89%)';

const PAYMENT_TYPE_CLASSES: Record<number, string> = {
  1: 'bg-green-50 text-green-600',
  2: 'bg-blue-50 text-blue-600',
};

export default function InvoicesList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { invoices, pagination, isLoading } = useSelector((state: RootState) => state.invoices);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  const isAr = i18n.language === 'ar';

  useEffect(() => {
    dispatch(
      fetchInvoices({
        schoolBranchId,
        PageIndex: 1,
        PageSize: pagination.pageSize,
        Search: searchTerm || undefined,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, schoolBranchId, searchTerm]);

  const handlePageChange = (page: number) => {
    dispatch(
      fetchInvoices({
        schoolBranchId,
        PageIndex: page,
        PageSize: pagination.pageSize,
        Search: searchTerm || undefined,
      })
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMethod('');
    setSelectedItem('');
    setSelectedStage('');
  };

  const methodOptions = [
    { value: 'cash', label: t('invoices.paymentMethods.cash') },
    { value: 'bankTransfer', label: t('invoices.paymentMethods.bankTransfer') },
    { value: 'deferred', label: t('invoices.paymentMethods.deferred') },
  ];

  const itemOptions = [
    { value: 'tuition', label: t('invoices.items.tuition') },
    { value: 'books', label: t('invoices.items.books') },
    { value: 'transport', label: t('invoices.items.transport') },
  ];

  const stageOptions = [
    { value: 'primary', label: t('invoices.stages.primary') },
    { value: 'middle', label: t('invoices.stages.middle') },
    { value: 'high', label: t('invoices.stages.high') },
  ];

  const columns: DataTableColumn<InvoiceDto>[] = [
    {
      header: 'invoices.table.index',
      accessor: (_, index) => (
        <span className="text-gray-500">
          {(pagination.pageIndex - 1) * pagination.pageSize + (index ?? 0) + 1}
        </span>
      ),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'invoices.table.invoiceDate',
      accessor: (row) => (
        <span className="font-medium text-gray-600">
          {row.invoiceDate ? row.invoiceDate.split('T')[0] : '-'}
        </span>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center text-gray-500',
    },
    {
      header: 'invoices.table.invoiceNumber',
      accessor: (row) => <span className="text-gray-600">{row.invoiceNumber}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.invoiceValue',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1 font-medium text-gray-800">
          <span>{row.totalAmount}</span>
          <CustomImage
            src={RyalIcon}
            alt="Ryal"
            className="h-4 w-4"
            style={{ filter: RyalFilter }}
          />
        </div>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.tax',
      accessor: (row) => <span className="font-medium text-gray-800">{row.taxPercentage}%</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.totalInvoice',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1 font-medium text-gray-800">
          <span>{row.netAmount}</span>
          <CustomImage
            src={RyalIcon}
            alt="Ryal"
            className="h-4 w-4"
            style={{ filter: RyalFilter }}
          />
        </div>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.studentName',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200">
            <CustomImage src={DefaultAvatar} alt="Student" className="h-full w-full object-cover" />
          </div>
          <span className="font-medium text-gray-800">{row.studentName ?? '-'}</span>
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
      ),
      headerClassName: 'min-w-[250px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.educationalStage',
      accessor: (row) => (
        <span className="font-medium text-gray-600">
          {(isAr ? row.gradeNameAr : row.gradeNameEn) ?? '-'}
        </span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.item',
      accessor: (row) => (
        <span className="font-medium text-gray-600">{row.itemsName?.join(', ') ?? '-'}</span>
      ),
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.paymentMethod',
      accessor: (row) => {
        const className = PAYMENT_TYPE_CLASSES[row.paymentType] ?? 'bg-gray-50 text-gray-600';
        const name = isAr ? row.paymentMethodNameAr : row.paymentMethodNameEn;
        return (
          <span
            className={`inline-flex min-w-[80px] justify-center rounded-full px-4 py-1.5 text-sm font-medium ${className}`}
          >
            {name ?? row.paymentMethodName ?? '-'}
          </span>
        );
      },
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.paymentTool',
      accessor: (row) => (
        <span className="text-gray-600">
          {(isAr ? row.paymentMethodNameAr : row.paymentMethodNameEn) ??
            row.paymentMethodName ??
            '-'}
        </span>
      ),
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.paymentDocument',
      accessor: (row) => (
        <div className="flex w-full items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-gray-200 bg-white p-1 shadow-sm">
            <CustomImage
              src={row.receiptUrl ?? PdfIcon}
              alt="Document"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      ),
      headerClassName: 'min-w-[130px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.actions',
      accessor: (row) => (
        <div className="flex items-center justify-center">
          <IconButton
            ariaLabel="View"
            onClick={() => navigate(`/financial-management/invoices/${row.id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-gray-100"
          >
            <CustomImage
              src={EyeStyledIcon}
              className="h-5 w-5"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(43%) sepia(91%) saturate(1512%) hue-rotate(200deg) brightness(101%) contrast(94%)',
              }}
            />
          </IconButton>
        </div>
      ),
      headerClassName: 'w-[100px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'invoice-search',
      placeholder: t('invoices.searchInvoiceNumber'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
      },
      width: '40%',
    },
    {
      type: 'custom',
      name: 'payment-method',
      value: selectedMethod,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedMethod}
          onChange={(value) => {
            setSelectedMethod(Array.isArray(value) ? (value[0] ?? '') : value);
          }}
          options={methodOptions}
          placeholder={t('invoices.paymentMethod')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'item',
      value: selectedItem,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedItem}
          onChange={(value) => {
            setSelectedItem(Array.isArray(value) ? (value[0] ?? '') : value);
          }}
          options={itemOptions}
          placeholder={t('invoices.item')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'stage',
      value: selectedStage,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStage}
          onChange={(value) => {
            setSelectedStage(Array.isArray(value) ? (value[0] ?? '') : value);
          }}
          options={stageOptions}
          placeholder={t('invoices.stage')}
          maxHeight="200px"
        />
      ),
    },
  ];

  return (
    <Card className="overflow-hidden">
      <DataTable
        data={invoices}
        columns={columns}
        keyExtractor={(row) => row.id}
        pagination={{
          page: pagination.pageIndex,
          limit: pagination.pageSize,
          total: pagination.totalItems,
          totalPages: pagination.totalPages,
        }}
        onPageChange={handlePageChange}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        emptyMessage={t('common.noDataFound')}
        t={t}
      />
    </Card>
  );
}
