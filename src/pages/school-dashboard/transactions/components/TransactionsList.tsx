import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import MetricCard from '@/shared/components/MetricCard';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import BillingIcon from '@gradex/assets/icons/Billing.svg';
import TimeSyncIcon from '@gradex/assets/icons/TimeSync.svg';
import CheckCircleIcon from '@gradex/assets/icons/CheckCircle.svg';
import IconButton from '@/shared/components/IconButton';

type TransactionStatus = 'paid' | 'pending' | 'late';
type PaymentMethodType = 'cash' | 'deferred';

interface TransactionItem {
  id: string;
  clientName: string;
  avatar: string;
  feeType: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  paymentChannel: string;
  date: string;
}

// Mock Data
const MOCK_TRANSACTIONS: TransactionItem[] = [
  {
    id: '1',
    clientName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    feeType: 'financialManagement.feeTypes.books',
    amount: 300,
    status: 'paid',
    paymentMethod: 'cash',
    paymentChannel: 'financialManagement.paymentChannels.applePay',
    date: '1/1/2020',
  },
  {
    id: '2',
    clientName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    feeType: 'financialManagement.feeTypes.tuition',
    amount: 300,
    status: 'paid',
    paymentMethod: 'cash',
    paymentChannel: 'financialManagement.paymentChannels.bankAccount',
    date: '1/1/2020',
  },
  {
    id: '3',
    clientName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    feeType: 'financialManagement.feeTypes.tuition',
    amount: 300,
    status: 'paid',
    paymentMethod: 'cash',
    paymentChannel: 'financialManagement.paymentChannels.eWallet',
    date: '1/1/2020',
  },
  {
    id: '4',
    clientName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    feeType: 'financialManagement.feeTypes.tuitionAndBooks',
    amount: 300,
    status: 'pending',
    paymentMethod: 'deferred',
    paymentChannel: 'financialManagement.paymentChannels.bankAccount',
    date: '1/1/2020',
  },
  {
    id: '5',
    clientName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    feeType: 'financialManagement.feeTypes.books',
    amount: 300,
    status: 'paid',
    paymentMethod: 'deferred',
    paymentChannel: 'financialManagement.paymentChannels.bankAccount',
    date: '1/1/2020',
  },
  {
    id: '6',
    clientName: 'أحمد معتز حسن',
    avatar: DefaultAvatar,
    feeType: 'financialManagement.feeTypes.books',
    amount: 300,
    status: 'paid',
    paymentMethod: 'deferred',
    paymentChannel: 'financialManagement.paymentChannels.bankAccount',
    date: '1/1/2020',
  },
];

const METHOD_META: Record<PaymentMethodType, { className: string; labelKey: string }> = {
  cash: {
    className: 'bg-green-50 text-green-600',
    labelKey: 'financialManagement.paymentMethods.cash',
  },
  deferred: {
    className: 'bg-blue-50 text-blue-600',
    labelKey: 'financialManagement.paymentMethods.deferred',
  },
};

const STATUS_META: Record<TransactionStatus, { className: string }> = {
  paid: { className: 'bg-green-100 text-green-700' },
  pending: { className: 'bg-orange-100 text-orange-700' },
  late: { className: 'bg-red-100 text-red-700' },
};

const PAGE_SIZE = 10;

export default function TransactionsList() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Filter options
  const methodOptions = [
    { value: 'cash', label: t('financialManagement.paymentMethods.cash') },
    { value: 'deferred', label: t('financialManagement.paymentMethods.deferred') },
  ];

  const statusOptions = [
    { value: 'paid', label: t('financialManagement.statuses.paid') },
    { value: 'pending', label: t('financialManagement.statuses.pendingOrLate') },
  ];

  // KPIs
  const kpis = [
    {
      id: 1,
      title: 'financialManagement.totalTransactions',
      value: '2.284',
      icon: (
        <CustomImage
          src={BillingIcon}
          className="h-6 w-6"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(43%) sepia(91%) saturate(1512%) hue-rotate(200deg) brightness(101%) contrast(94%)',
          }}
        />
      ),
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 2,
      title: 'financialManagement.statuses.pendingOrLate',
      value: '2.284',
      icon: (
        <CustomImage
          src={TimeSyncIcon}
          className="h-6 w-6"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(53%) sepia(74%) saturate(1131%) hue-rotate(352deg) brightness(97%) contrast(87%)',
          }}
        />
      ),
      iconBg: 'bg-yellow-50 text-yellow-600',
    },
    {
      id: 3,
      title: 'financialManagement.statuses.paid',
      value: '2.284',
      icon: (
        <CustomImage
          src={CheckCircleIcon}
          className="h-6 w-6"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(49%) sepia(43%) saturate(541%) hue-rotate(85deg) brightness(96%) contrast(91%)',
          }}
        />
      ),
      iconBg: 'bg-green-50 text-green-600',
    },
  ];

  // Filtering Logic
  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return MOCK_TRANSACTIONS.filter((item) => {
      const matchSearch =
        !normalizedSearch || item.clientName.toLowerCase().includes(normalizedSearch);

      const matchStatus =
        !selectedStatus ||
        (selectedStatus === 'pending'
          ? item.status === 'pending' || item.status === 'late'
          : item.status === selectedStatus);

      return matchSearch && matchStatus;
    });
  }, [searchTerm, selectedStatus]);

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
    setSelectedStatus('');
    setPage(1);
  };

  // Columns definition
  const columns: DataTableColumn<TransactionItem>[] = [
    {
      header: 'financialManagement.table.index',
      accessor: (_, index) => <span>{(page - 1) * PAGE_SIZE + (index ?? 0) + 1}</span>,
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'financialManagement.table.clientName',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
            <CustomImage
              src={row.avatar}
              alt={row.clientName}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="w-[100px] font-medium text-gray-800">{row.clientName}</span>

          <IconButton
            variant="blue"
            ariaLabel="View"
            onClick={() => {}}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100"
          >
            <CustomImage src={EyeStyledIcon} alt="View" className="h-5 w-5" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'financialManagement.table.feeItem',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-6">
          <span className="font-medium text-gray-600">{t(row.feeType)}</span>
        </div>
      ),
      headerClassName: 'min-w-[250px]',
      className: 'text-center',
    },
    {
      header: 'financialManagement.table.amount',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1 font-medium text-gray-800">
          <span>{row.amount}</span>
          <span className="text-sm text-gray-500">﷼</span>
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
    {
      header: 'financialManagement.table.status',
      accessor: (row) => {
        const meta = STATUS_META[row.status];
        return (
          <span
            className={`inline-flex min-w-[100px] justify-center rounded-full px-4 py-1.5 text-sm font-medium ${meta.className}`}
          >
            {t(`financialManagement.statuses.${row.status}`)}
          </span>
        );
      },
      headerClassName: 'min-w-[140px]',
      className: 'text-center',
    },
    {
      header: 'financialManagement.paymentMethod',
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
      header: 'financialManagement.table.paymentChannel',
      accessor: (row) => <span className="text-gray-600">{t(row.paymentChannel)}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'financialManagement.table.date',
      accessor: (row) => <span className="font-medium text-gray-600">{row.date}</span>,
      headerClassName: 'min-w-[120px]',
      className: 'text-center text-gray-500',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'client-search',
      placeholder: t('financialManagement.searchClientName'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '50%',
    },
    {
      type: 'custom',
      name: 'payment-method',
      value: selectedMethod,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedMethod}
          onChange={(value) => {
            setSelectedMethod(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={methodOptions}
          placeholder={t('financialManagement.paymentMethod')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'payment-status',
      value: selectedStatus,
      onChange: () => {},
      width: '25%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={statusOptions}
          placeholder={t('financialManagement.paymentStatus')}
          maxHeight="200px"
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {kpis.map((kpi) => (
          <MetricCard
            key={kpi.id}
            title={t(kpi.title)}
            value={kpi.value}
            icon={kpi.icon}
            iconClassName={kpi.iconBg}
          />
        ))}
      </div>

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
          floatingActions={false}
        />
      </Card>
    </div>
  );
}
