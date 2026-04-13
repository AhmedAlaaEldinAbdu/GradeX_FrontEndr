import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import CustomSelect from '@/shared/components/CustomSelect';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';
import EyeIcon from '@gradex/assets/icons/EyeStyled.svg';
import EditFilledIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';

interface ClientItem {
  id: string;
  clientName: string;
  avatar: string;
  clientNumber: string;
  mobile: string;
  status: 'paid' | 'pending' | 'late';
  item: 'books' | 'tuition';
}

const MOCK_CLIENTS: ClientItem[] = Array.from({ length: 7 }).map((_, index) => ({
  id: String(index + 1),
  clientName: 'أحمد معتز حسن',
  avatar: DefaultAvatar,
  clientNumber: '34356',
  mobile: '556 8345 6576 7687',
  status: index % 2 === 0 ? 'paid' : 'pending',
  item: index % 2 === 0 ? 'books' : 'tuition',
}));

const PAGE_SIZE = 10;

export default function ClientsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [page, setPage] = useState(1);

  const statusOptions = [
    { value: 'paid', label: t('financialManagement.statuses.paid') },
    { value: 'pending', label: t('financialManagement.statuses.pending') },
    { value: 'late', label: t('financialManagement.statuses.late') },
  ];

  const itemOptions = [
    { value: 'books', label: t('financialManagement.feeTypes.books') },
    { value: 'tuition', label: t('financialManagement.feeTypes.tuition') },
  ];

  // Filtering Logic
  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return MOCK_CLIENTS.filter((client) => {
      const matchSearch =
        !normalizedSearch ||
        client.clientName.toLowerCase().includes(normalizedSearch) ||
        client.clientNumber.includes(normalizedSearch);
      const matchStatus = !selectedStatus || client.status === selectedStatus;
      const matchItem = !selectedItem || client.item === selectedItem;

      return matchSearch && matchStatus && matchItem;
    });
  }, [searchTerm, selectedStatus, selectedItem]);

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
    setSelectedStatus('');
    setSelectedItem('');
    setPage(1);
  };

  const columns: DataTableColumn<ClientItem>[] = [
    {
      header: 'clients.table.index',
      accessor: (_, index) => (
        <span className="text-gray-500">{(page - 1) * PAGE_SIZE + (index ?? 0) + 1}</span>
      ),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'clients.table.clientName',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200">
            <CustomImage src={row.avatar} alt="Client" className="h-full w-full object-cover" />
          </div>
          <span className="shrink-0 font-medium text-gray-800">{row.clientName}</span>
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
      header: 'clients.table.clientNumber',
      accessor: (row) => <span className="font-medium text-gray-600">{row.clientNumber}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'clients.table.mobile',
      accessor: (row) => (
        <span dir="ltr" className="inline-block font-medium text-gray-600">
          {row.mobile}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'clients.table.communication',
      accessor: () => (
        <div className="flex items-center justify-center gap-3">
          <IconButton
            ariaLabel="Email"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 transition-colors hover:bg-orange-100"
          >
            <CustomImage src={EmailYellowIcon} alt="Email" className="h-4 w-4" />
          </IconButton>
          <IconButton
            ariaLabel="WhatsApp"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 transition-colors hover:bg-green-100"
          >
            <CustomImage src={WhatsAppIcon} alt="WhatsApp" className="h-4 w-4" />
          </IconButton>
        </div>
      ),
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'clients.table.actions',
      accessor: (row) => {
        const actions: Action[] = [
          {
            id: 'view',
            label: t('actions.view'),
            icon: EyeIcon,
            color: 'text-blue-500 hover:bg-blue-50',
            onClick: () => {},
          },
          {
            id: 'edit',
            label: t('actions.edit'),
            icon: EditFilledIcon,
            color: 'text-green-500 hover:bg-green-50',
            onClick: () => navigate(`/financial-management/clients/edit-client/${row.id}`),
          },
          {
            id: 'delete',
            label: t('actions.delete'),
            icon: TrashIcon,
            color: 'text-red-500 hover:bg-red-50',
            onClick: () => {},
          },
        ];
        return (
          <div className="flex items-center justify-center">
            <ActionsDropdown actions={actions} />
          </div>
        );
      },
      headerClassName: 'w-[100px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'client-search',
      placeholder: t('clients.searchClientName'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
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
          placeholder={t('clients.item')}
          maxHeight="200px"
        />
      ),
    },
    {
      type: 'custom',
      name: 'payment-status',
      value: selectedStatus,
      onChange: () => {},
      width: '20%',
      customComponent: (
        <CustomSelect
          value={selectedStatus}
          onChange={(value) => {
            setSelectedStatus(Array.isArray(value) ? (value[0] ?? '') : value);
            setPage(1);
          }}
          options={statusOptions}
          placeholder={t('clients.paymentStatus')}
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
