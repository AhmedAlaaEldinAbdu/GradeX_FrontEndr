import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { fetchCustomers, deleteCustomer } from '@/redux/features/customers/customersSlice';
import Card from '@/shared/components/Card';
import CustomImage from '@/shared/components/CustomImage';
import DataTable, { type DataTableColumn, type FilterConfig } from '@/shared/components/DataTable';
import IconButton from '@/shared/components/IconButton';
import ActionsDropdown, { type Action } from '@/shared/components/ActionsDropdown';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import type { CustomerDto } from '@/services/api/types/customer.types';
import { tokenManager } from '@gradex/lib/auth/token-manager';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';

import DefaultAvatar from '@gradex/assets/images/profile.png';
import EyeStyledIcon from '@gradex/assets/icons/EyeStyled.svg';
import WhatsAppIcon from '@gradex/assets/icons/WhatsApp.svg';
import EmailYellowIcon from '@gradex/assets/icons/EmailYellow.svg';
import EyeIcon from '@gradex/assets/icons/EyeStyled.svg';
import EditFilledIcon from '@gradex/assets/icons/Edit.svg';
import TrashIcon from '@gradex/assets/icons/Trash.svg';

export default function CustomersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { customers, pagination, isLoading, isDeleting } = useSelector(
    (state: RootState) => state.customers
  );
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const schoolBranchId =
    tokenManager.getUserData()?.schoolBrancheId ?? tokenManager.getUserData()?.schoolBranchId ?? '';

  useEffect(() => {
    if (!schoolBranchId) return;
    dispatch(
      fetchCustomers({
        SchoolBranchId: schoolBranchId,
        PageIndex: 1,
        PageSize: pagination.pageSize,
        Search: searchTerm || undefined,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, searchTerm, schoolBranchId]);

  const handlePageChange = (page: number) => {
    if (!schoolBranchId) return;
    dispatch(
      fetchCustomers({
        SchoolBranchId: schoolBranchId,
        PageIndex: page,
        PageSize: pagination.pageSize,
        Search: searchTerm || undefined,
      })
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteCustomer(pendingDeleteId)).unwrap();
      setShowDeletePopup(false);
      setPendingDeleteId(null);
      showToast({ message: t('customers.customerDeletedSuccessfully'), type: 'success' });
    } catch (error: unknown) {
      const message = typeof error === 'string' ? error : t('common.errorOccurred');
      showToast({ message, type: 'error', isRaw: typeof error === 'string' });
    }
  };

  const columns: DataTableColumn<CustomerDto>[] = [
    {
      header: 'customers.table.index',
      accessor: (_, index) => (
        <span className="text-gray-500">
          {(pagination.pageIndex - 1) * pagination.pageSize + (index ?? 0) + 1}
        </span>
      ),
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'customers.table.clientName',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200">
            <CustomImage
              src={DefaultAvatar}
              alt="Customer"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="shrink-0 font-medium text-gray-800">{row.name}</span>
          <IconButton
            variant="blue"
            ariaLabel="View"
            onClick={() => navigate(`/financial-management/customers/${row.id}`)}
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
      header: 'customers.table.clientNumber',
      accessor: (row) => <span className="font-medium text-gray-600">{row.nationalId}</span>,
      headerClassName: 'min-w-[150px]',
      className: 'text-center',
    },
    {
      header: 'customers.table.mobile',
      accessor: (row) => (
        <span dir="ltr" className="inline-block font-medium text-gray-600">
          {row.areaCode} {row.phoneNumber}
        </span>
      ),
      headerClassName: 'min-w-[200px]',
      className: 'text-center',
    },
    {
      header: 'customers.table.communication',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-3">
          <IconButton
            ariaLabel="Email"
            onClick={() => window.open(`mailto:${row.email}`, '_blank')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 transition-colors hover:bg-orange-100"
          >
            <CustomImage src={EmailYellowIcon} alt="Email" className="h-4 w-4" />
          </IconButton>
          <IconButton
            ariaLabel="WhatsApp"
            onClick={() =>
              window.open(
                `https://wa.me/${row.areaCode.replace(/\D/g, '')}${row.phoneNumber.replace(/\D/g, '')}`,
                '_blank'
              )
            }
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
      header: 'customers.table.actions',
      accessor: (row) => {
        const actions: Action[] = [
          {
            id: 'view',
            label: t('actions.view'),
            icon: EyeIcon,
            color: 'text-blue-500 hover:bg-blue-50',
            onClick: () => navigate(`/financial-management/customers/${row.id}`),
          },
          {
            id: 'edit',
            label: t('actions.edit'),
            icon: EditFilledIcon,
            color: 'text-green-500 hover:bg-green-50',
            onClick: () => navigate(`/financial-management/customers/edit-client/${row.id}`),
          },
          {
            id: 'delete',
            label: t('actions.delete'),
            icon: TrashIcon,
            color: 'text-red-500 hover:bg-red-50',
            onClick: () => {
              setPendingDeleteId(row.id);
              setShowDeletePopup(true);
            },
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
      name: 'customer-search',
      placeholder: t('customers.searchClientName'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
      },
      width: '40%',
    },
  ];

  const pendingCustomerName = customers.find((c) => c.id === pendingDeleteId)?.name ?? '';

  return (
    <>
      <Card className="overflow-hidden">
        <DataTable
          data={customers}
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
      <DeletePopup
        open={showDeletePopup}
        message="customers.confirmDeleteCustomer"
        itemName={pendingCustomerName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeletePopup(false);
          setPendingDeleteId(null);
        }}
        iconSrc={BigTrashIcon}
        isProcessing={isDeleting}
      />
    </>
  );
}
