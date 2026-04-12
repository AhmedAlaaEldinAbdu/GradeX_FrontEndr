import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import PdfIcon from '@gradex/assets/icons/Pdf.svg';

interface InvoiceItem {
  id: string;
  date: string;
  invoiceNumber: string;
  value: number;
  tax: number;
  total: number;
  studentName: string;
  avatar: string;
  stage: string;
  item: string;
  paymentMethod: 'cash' | 'deferred';
  paymentTool: string;
  paymentDocument: string;
}

const METHOD_META: Record<'cash' | 'deferred', { className: string; labelKey: string }> = {
  cash: {
    className: 'bg-green-50 text-green-600',
    labelKey: 'invoices.paymentMethods.cash',
  },
  deferred: {
    className: 'bg-blue-50 text-blue-600',
    labelKey: 'invoices.paymentMethods.deferred',
  },
};

// Dummy configuration based on the screenshot
const MOCK_INVOICES: InvoiceItem[] = [
  {
    id: '1',
    date: '1/1/2020',
    invoiceNumber: '1224556',
    value: 300,
    tax: 300,
    total: 300,
    studentName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    stage: 'invoices.stages.kindergarten',
    item: 'invoices.items.books',
    paymentMethod: 'cash',
    paymentTool: 'financialManagement.paymentChannels.applePay', // re-using channel trans
    paymentDocument: PdfIcon, // Dummy thumbnail
  },
  {
    id: '2',
    date: '1/1/2020',
    invoiceNumber: '1224556',
    value: 300,
    tax: 300,
    total: 300,
    studentName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    stage: 'invoices.stages.kindergarten',
    item: 'invoices.items.tuition',
    paymentMethod: 'cash',
    paymentTool: 'financialManagement.paymentChannels.bankAccount',
    paymentDocument: PdfIcon,
  },
  {
    id: '3',
    date: '1/1/2020',
    invoiceNumber: '1224556',
    value: 300,
    tax: 300,
    total: 300,
    studentName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    stage: 'invoices.stages.kindergarten',
    item: 'invoices.items.tuition',
    paymentMethod: 'cash',
    paymentTool: 'financialManagement.paymentChannels.eWallet',
    paymentDocument: PdfIcon,
  },
  {
    id: '4',
    date: '1/1/2020',
    invoiceNumber: '1224556',
    value: 300,
    tax: 300,
    total: 300,
    studentName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    stage: 'invoices.stages.kindergarten',
    item: 'invoices.items.books',
    paymentMethod: 'deferred',
    paymentTool: 'financialManagement.paymentChannels.bankAccount',
    paymentDocument: PdfIcon,
  },
  {
    id: '5',
    date: '1/1/2020',
    invoiceNumber: '1224556',
    value: 300,
    tax: 300,
    total: 300,
    studentName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    stage: 'invoices.stages.kindergarten',
    item: 'invoices.items.books',
    paymentMethod: 'deferred',
    paymentTool: 'financialManagement.paymentChannels.bankAccount',
    paymentDocument: PdfIcon,
  },
  {
    id: '6',
    date: '1/1/2020',
    invoiceNumber: '1224556',
    value: 300,
    tax: 300,
    total: 300,
    studentName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    stage: 'invoices.stages.kindergarten',
    item: 'invoices.items.books',
    paymentMethod: 'deferred',
    paymentTool: 'financialManagement.paymentChannels.bankAccount',
    paymentDocument: PdfIcon,
  },
];

const PAGE_SIZE = 10;

export default function InvoicesList() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [page, setPage] = useState(1);

  // Filter options mapping translated strings
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

  // Filtering Logic
  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim();

    return MOCK_INVOICES.filter((invoice) => {
      const matchSearch = !normalizedSearch || invoice.invoiceNumber.includes(normalizedSearch);
      const matchMethod = !selectedMethod || invoice.paymentMethod === selectedMethod;
      const matchItem = !selectedItem || invoice.item === selectedItem;
      const matchStage = !selectedStage || invoice.stage === selectedStage;

      return matchSearch && matchMethod && matchItem && matchStage;
    });
  }, [searchTerm, selectedMethod, selectedItem, selectedStage]);

  useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [filteredData.length, page]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, page]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedMethod('');
    setSelectedItem('');
    setSelectedStage('');
    setPage(1);
  };

  // Columns definition
  const columns: DataTableColumn<InvoiceItem>[] = [
    {
      header: 'invoices.table.index',
      accessor: (_, index) => (
        <span className="text-gray-500">{(page - 1) * PAGE_SIZE + (index ?? 0) + 1}</span>
      ),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'invoices.table.invoiceDate',
      accessor: (row) => <span className="font-medium text-gray-600">{row.date}</span>,
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
          <span>{row.value}</span>
          <span className="text-sm text-gray-500">﷼</span>
        </div>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.tax',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1 font-medium text-gray-800">
          <span>{row.tax}</span>
          <span className="text-sm text-gray-500">﷼</span>
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.totalInvoice',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1 font-medium text-gray-800">
          <span>{row.total}</span>
          <span className="text-sm text-gray-500">﷼</span>
        </div>
      ),
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.studentName',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
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
          <span className="font-medium text-gray-800">{row.studentName}</span>
          <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200">
            <CustomImage src={row.avatar} alt="Student" className="h-full w-full object-cover" />
          </div>
        </div>
      ),
      headerClassName: 'min-w-[250px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.educationalStage',
      accessor: (row) => <span className="font-medium text-gray-600">{t(row.stage)}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.item',
      accessor: (row) => <span className="font-medium text-gray-600">{t(row.item)}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.paymentMethod',
      accessor: (row) => {
        const meta = METHOD_META[row.paymentMethod];
        return (
          <span
            className={`inline-flex min-w-[80px] justify-center rounded-full px-4 py-1.5 text-sm font-medium ${meta.className}`}
          >
            {t(meta.labelKey)}
          </span>
        );
      },
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.paymentTool',
      accessor: (row) => <span className="text-gray-600">{t(row.paymentTool)}</span>,
      headerClassName: 'min-w-[160px]',
      className: 'text-center',
    },
    {
      header: 'invoices.table.paymentDocument',
      accessor: (row) => (
        <div className="flex w-full items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-gray-200 bg-white p-1 shadow-sm">
            <CustomImage
              src={row.paymentDocument}
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
      accessor: () => (
        <div className="flex items-center justify-center">
          <IconButton
            ariaLabel="View"
            onClick={() => {}}
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
        setPage(1);
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
            setPage(1);
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
            setPage(1);
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
            setPage(1);
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
        data={paginatedData}
        columns={columns}
        keyExtractor={(row) => row.id}
        pagination={{
          page,
          limit: PAGE_SIZE,
          total: filteredData.length,
          totalPages,
        }}
        onPageChange={setPage}
        filters={filterConfigs}
        showFilters={true}
        onResetFilters={handleResetFilters}
        isLoading={false}
        emptyMessage={t('common.noDataFound')}
        t={t}
      />
    </Card>
  );
}
