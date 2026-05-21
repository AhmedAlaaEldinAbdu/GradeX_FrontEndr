import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/shared/components/Card';
import EmptyState from '@/shared/components/EmptyState';
import IconButton from '@/shared/components/IconButton';
import DeletePopup from '@/shared/popups/DeletePopup';
import { useToast } from '@/shared/context/ToastContext';
import DataTable, { type FilterConfig, type DataTableColumn } from '@/shared/components/DataTable';
import PeopleSupportIcon from '@/assets/icons/PeopleSupport.svg';
import BigTrashIcon from '@gradex/assets/icons/BigTrash.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchUsers,
  deleteUser,
  selectUsers,
  selectIsLoading,
  selectIsDeleting,
  selectIsInitialized,
  selectPagination,
} from '@/redux/features/user-management';
import type { User } from '@/services/api/types/users.types';

const PAGE_SIZE = 10;

export default function SystemUsersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const users = useAppSelector(selectUsers);
  const isLoading = useAppSelector(selectIsLoading);
  const isDeleting = useAppSelector(selectIsDeleting);
  const isInitialized = useAppSelector(selectIsInitialized);
  const pagination = useAppSelector(selectPagination);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(
      fetchUsers({
        page,
        limit: PAGE_SIZE,
        filters: {
          searchTerm: searchTerm || undefined,
        },
      })
    );
  }, [dispatch, page, searchTerm]);

  const hasActiveFilters = !!searchTerm;
  const shouldShowEmptyState =
    !isLoading && isInitialized && users.length === 0 && !hasActiveFilters;

  const columns: DataTableColumn<User>[] = [
    {
      header: '#',
      accessor: (row) => {
        const rowIndex = users.findIndex((u) => u.id === row.id);
        return (page - 1) * PAGE_SIZE + rowIndex + 1;
      },
      headerClassName: 'w-16',
      className: 'text-center',
    },
    {
      header: 'rolesManagement.role',
      accessor: (row) => (
        <span>{row.roles && row.roles.length > 0 ? row.roles.join(', ') : '-'}</span>
      ),
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'rolesManagement.userName',
      accessor: (row) => <span>{row.fullName}</span>,
      headerClassName: 'min-w-[300px]',
    },
    {
      header: 'common.actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            status="edit"
            variant="success"
            onClick={() => navigate(`/settings/job-roles/edit-user/${row.id}`)}
            ariaLabel="Edit"
          />
          <IconButton
            status="delete"
            variant="danger"
            onClick={() => {
              setSelectedUserId(row.id);
              setShowDeletePopup(true);
            }}
            disabled={isDeleting}
            ariaLabel="Delete"
          />
        </div>
      ),
      headerClassName: 'min-w-[120px]',
      className: 'text-center',
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      type: 'search',
      name: 'user-search',
      placeholder: t('rolesManagement.searchEmployee'),
      value: searchTerm,
      onChange: (value) => {
        setSearchTerm(value as string);
        setPage(1);
      },
      width: '40%',
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    try {
      await dispatch(deleteUser(selectedUserId)).unwrap();
      showToast({ message: 'rolesManagement.userDeleted', type: 'success' });
      dispatch(
        fetchUsers({
          page,
          limit: PAGE_SIZE,
          filters: {
            searchTerm: searchTerm || undefined,
          },
        })
      );
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'common.errorOccurred';
      const isApiError = typeof error === 'string' && error !== 'common.errorOccurred';
      showToast({ message: errorMessage, type: 'error', isRaw: isApiError });
    } finally {
      setShowDeletePopup(false);
      setSelectedUserId(null);
    }
  };

  return (
    <Card>
      {shouldShowEmptyState ? (
        <EmptyState
          imgSrc={PeopleSupportIcon}
          description={t('rolesManagement.noUsersMessage')}
          blend={true}
        />
      ) : (
        <div>
          <DataTable
            data={users}
            columns={columns}
            keyExtractor={(row) => row.id}
            pagination={{
              page,
              limit: PAGE_SIZE,
              total: pagination.total,
              totalPages: pagination.totalPages,
            }}
            onPageChange={setPage}
            filters={filterConfigs}
            showFilters={true}
            onResetFilters={() => {
              setSearchTerm('');
              setPage(1);
            }}
            isLoading={isLoading}
            emptyMessage={t('common.noResults')}
            t={t}
          />

          <DeletePopup
            open={showDeletePopup}
            message="rolesManagement.confirmDeleteUser"
            itemName={users.find((u) => u.id === selectedUserId)?.fullName ?? ''}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeletePopup(false)}
            iconSrc={BigTrashIcon}
            isProcessing={isDeleting}
          />
        </div>
      )}
    </Card>
  );
}
