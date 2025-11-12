import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@gradex/redux/store/store';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Table from '@gradex/shared/components/Table';
import Pagination from '@gradex/shared/components/Pagination';
import Loading from '@gradex/shared/components/Loading';
import TrashIcon from '@gradex/assets/icons/Trash.svg';
import EditIcon from '@gradex/assets/icons/Edit.svg';
import type { User } from '@gradex/services/api/types/users.types';
import {
  fetchUsers,
  selectUsers,
  selectIsLoading,
  selectPagination,
} from '@gradex/redux/features/user-management';

interface SystemUsersTableProps {
  filters?: {
    searchTerm?: string;
    roleId?: string;
  };
  isDeleting: boolean;
  onDeleteClick: (userId: string) => void;
}

export default function SystemUsersTable({
  filters,
  isDeleting,
  onDeleteClick,
}: SystemUsersTableProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const users = useSelector(selectUsers) || [];
  const isLoading = useSelector(selectIsLoading);
  const pagination = useSelector(selectPagination);

  useEffect(() => {
    const filtersObj: Record<string, string> = {};
    if (filters?.searchTerm) filtersObj.searchTerm = filters.searchTerm;
    if (filters?.roleId) filtersObj.roleId = filters.roleId;

    dispatch(
      fetchUsers({
        page: 1,
        limit: 10,
        filters: Object.keys(filtersObj).length > 0 ? filtersObj : undefined,
      })
    );
  }, [dispatch, filters]);

  const handlePageChange = (page: number) => {
    const filtersObj: Record<string, string> = {};
    if (filters?.searchTerm) filtersObj.searchTerm = filters.searchTerm;
    if (filters?.roleId) filtersObj.roleId = filters.roleId;

    dispatch(
      fetchUsers({
        page,
        limit: pagination.limit,
        filters: Object.keys(filtersObj).length > 0 ? filtersObj : undefined,
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loading />
      </div>
    );
  }

  const columns = [
    {
      header: '#',
      accessor: (_row: User) => {
        if (!_row || !Array.isArray(users) || !pagination) return '-';
        const index = users.findIndex((s) => s?.id === _row?.id);
        return (pagination.page - 1) * pagination.limit + index + 1;
      },
    },
    {
      header: 'rolesManagement.userName',
      accessor: (row: User) => row.fullName,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'rolesManagement.roleName',
      accessor: (row: User) => (row.roles && row.roles.length > 0 ? row.roles.join(', ') : '-'),
      headerClassName: 'min-w-[100px]',
    },
    {
      header: 'rolesManagement.phoneNumber',
      accessor: (row: User) => <bdi>{row.phoneNumber || '-'}</bdi>,
      headerClassName: 'min-w-[150px]',
    },
    {
      header: 'rolesManagement.email',
      accessor: (row: User) => row.email,
      headerClassName: 'min-w-[200px]',
    },
    {
      header: 'common.actions',
      accessor: (row: User) => (
        <div className="flex items-center gap-2">
          <Link
            to={`edit-user/${row.id}`}
            className="rounded-full bg-green-50 p-2 text-green-600 transition-colors hover:bg-green-100"
          >
            <img src={EditIcon} alt="Edit" />
          </Link>
          <button
            onClick={() => onDeleteClick(row.id)}
            disabled={isDeleting}
            className="rounded-full bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <img src={TrashIcon} alt="Delete" />
          </button>
        </div>
      ),
      headerClassName: 'min-w-[100px]',
    },
  ];

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        {!Array.isArray(users) || users.length === 0 ? (
          <div className="py-10 text-center text-gray-500">{t('rolesManagement.noUsersFound')}</div>
        ) : (
          <Table columns={columns} data={users} keyExtractor={(row) => row.id} />
        )}
      </div>

      {/* Pagination */}
      {Array.isArray(users) && users.length > 0 && pagination && pagination.totalPages > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          to={Math.min(pagination.page * pagination.limit, pagination.total)}
          from={(pagination.page - 1) * pagination.limit + 1}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
